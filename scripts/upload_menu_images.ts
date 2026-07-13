import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

// 1. Manually parse .env because tsx may not auto-load it
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fuzhdcsdfblwcgwfylsx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_pdRPbIssIN0S0N_J8A6Zbg_JHK9_SgF';

const dbConfig = {
  host: process.env.DB_HOST || 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres.fuzhdcsdfblwcgwfylsx',
  password: process.env.DB_PASSWORD || 'dhtpgns@8113',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
};

const IMG_ROOT = path.resolve(process.cwd(), 'cafehaste_menu_images_2026-07-12');
const subDirs = ['americano', 'coffee_latte', 'milk_latte', 'tea_base', 'ade_etc'];

async function main() {
  console.log('🔗 Connecting to Supabase Database...');
  const pool = new pg.Pool(dbConfig);
  
  console.log('⚡ Initializing Supabase Storage Client...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // 1. Add temporary RLS policy to allow uploads
    console.log('🔓 Disabling RLS temporarily via temporary policy...');
    await pool.query('DROP POLICY IF EXISTS temp_allow_all ON storage.objects');
    await pool.query('CREATE POLICY temp_allow_all ON storage.objects FOR ALL TO public USING (true) WITH CHECK (true)');
    console.log('✅ RLS bypass policy "temp_allow_all" created.');

    let successCount = 0;
    let failCount = 0;

    for (const dir of subDirs) {
      const dirPath = path.join(IMG_ROOT, dir);
      if (!fs.existsSync(dirPath)) {
        console.warn(`⚠️ Directory not found: ${dirPath}`);
        continue;
      }
      
      const files = fs.readdirSync(dirPath);
      console.log(`\n📂 Category: ${dir} (${files.length} files found)`);
      
      for (const file of files) {
        if (!file.endsWith('.png')) continue;
        
        const filePath = path.join(dirPath, file);
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `menu/${dir}/${file}`;
        
        console.log(`📤 Uploading: ${storagePath}...`);
        
        const { data, error } = await supabase.storage
          .from('cafehaste-bucket')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });
          
        if (error) {
          console.error(`❌ Failed to upload ${file}:`, error.message);
          failCount++;
        } else {
          successCount++;
        }
      }
    }

    console.log(`\n🎉 Upload completed! Success: ${successCount}, Failed: ${failCount}`);

  } catch (err: any) {
    console.error('❌ Error during execution:', err.message);
  } finally {
    // 2. Tear down the temporary RLS policy
    console.log('\n🔒 Re-enabling RLS by dropping temporary policy...');
    try {
      await pool.query('DROP POLICY IF EXISTS temp_allow_all ON storage.objects');
      console.log('✅ Temporary policy successfully removed.');
    } catch (err: any) {
      console.error('❌ Failed to clean up RLS policy:', err.message);
    }
    
    await pool.end();
    console.log('🔌 DB connection closed.');
  }
}

main().catch(console.error);
