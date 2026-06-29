import { runTableRenames, seedInitialData } from './seeder';

export async function setupDatabaseSchema(connection: any, database: string) {
  // 1. Run Legacy Table Reroutes (haste_ to web_)
  await runTableRenames(connection, database);

  // 2. Clear & Create Web Schema Tables
  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_membership_users (
      id SERIAL PRIMARY KEY,
      store_name VARCHAR(255) NOT NULL,
      store_code VARCHAR(100) NULL,
      owner_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address VARCHAR(500) NULL,
      content TEXT NULL,
      approval_status VARCHAR(50) DEFAULT '요청',
      store_type VARCHAR(50) DEFAULT '일반',
      business_number VARCHAR(100) NULL,
      business_cert_path VARCHAR(500) NULL,
      signup_path VARCHAR(255) DEFAULT '맴버십가입신청',
      password VARCHAR(255) NULL,
      role VARCHAR(50) DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_membership_consultations (
      id SERIAL PRIMARY KEY,
      region_name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      capital VARCHAR(255) NULL,
      has_store VARCHAR(50) DEFAULT '없음',
      inquiry_path VARCHAR(255) NULL,
      signup_path VARCHAR(255) DEFAULT '창업문의',
      content TEXT NULL,
      approval_status VARCHAR(50) DEFAULT '요청',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_board_posts (
      id SERIAL PRIMARY KEY,
      member_id INT NOT NULL,
      writer_name VARCHAR(255) NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'Q&A',
      skin_type INT DEFAULT 1,
      is_secret BOOLEAN DEFAULT FALSE,
      is_notice BOOLEAN DEFAULT FALSE,
      view_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await connection.query('ALTER TABLE web_board_posts ADD COLUMN writer_name VARCHAR(255) NULL');
  } catch (err) {
    // Ignore error if column already exists
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_board_attachments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_board_comments (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL,
      member_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_admin_accounts (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_home_main (
      id SERIAL PRIMARY KEY,
      tag VARCHAR(255) NOT NULL,
      slogan VARCHAR(255) NOT NULL,
      subtext VARCHAR(255) NOT NULL,
      bg_image TEXT NOT NULL,
      description TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      default_tag VARCHAR(255) NULL,
      default_slogan VARCHAR(255) NULL,
      default_subtext VARCHAR(255) NULL,
      default_bg_image TEXT NULL,
      default_description TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_interior_layouts (
      id SERIAL PRIMARY KEY,
      type_id VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) NOT NULL,
      "desc" TEXT NOT NULL,
      tags TEXT NOT NULL,
      highlights TEXT NOT NULL,
      gallery TEXT NOT NULL,
      video_links TEXT NULL,
      mock_image TEXT NOT NULL,
      blueprint_image TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      default_title VARCHAR(255) NULL,
      default_subtitle VARCHAR(255) NULL,
      default_desc TEXT NULL,
      default_tags TEXT NULL,
      default_highlights TEXT NULL,
      default_gallery TEXT NULL,
      default_video_links TEXT NULL,
      default_mock_image TEXT NULL,
      default_blueprint_image TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_menu_categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      "desc" TEXT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_brand_films (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NOT NULL,
      video_url TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      category VARCHAR(50) DEFAULT 'THEATER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_brand_sounds (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NOT NULL,
      sound_url TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_menu_items (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_kr VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      image TEXT NULL,
      description TEXT NULL,
      acidity INT NOT NULL DEFAULT 0,
      sweetness INT NOT NULL DEFAULT 0,
      body INT NOT NULL DEFAULT 0,
      bitterness INT NOT NULL DEFAULT 0,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      is_signature BOOLEAN NOT NULL DEFAULT FALSE,
      video_url TEXT NULL,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_store_licenses (
      id SERIAL PRIMARY KEY,
      store_name VARCHAR(255) NOT NULL,
      store_id VARCHAR(100) NOT NULL UNIQUE,
      license_start_date DATE NOT NULL,
      license_end_date DATE NOT NULL,
      is_approved BOOLEAN DEFAULT TRUE,
      store_grade VARCHAR(50) DEFAULT 'PREMIUM',
      password VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_verify_logs (
      id SERIAL PRIMARY KEY,
      store_id VARCHAR(100) NOT NULL,
      ip VARCHAR(50) NOT NULL,
      is_approved BOOLEAN NOT NULL,
      status_type VARCHAR(10) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_grade_permissions (
      id SERIAL PRIMARY KEY,
      grade_type VARCHAR(50) NOT NULL,
      category_key VARCHAR(100) NOT NULL,
      can_read INT DEFAULT 1,
      can_write INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_grade_category UNIQUE (grade_type, category_key)
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_songs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NULL,
      "desc" TEXT NULL,
      genre VARCHAR(100) NULL,
      mood VARCHAR(100) NULL,
      sound_url TEXT NOT NULL,
      cover_url TEXT NULL,
      lyrics TEXT NULL,
      visible BOOLEAN DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      owner_pick BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_covers (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NULL,
      video_url TEXT NOT NULL,
      weather VARCHAR(100) NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_playlists (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      "desc" TEXT NULL,
      cover_url TEXT NULL,
      mood_tags TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_comments (
      id SERIAL PRIMARY KEY,
      song_id INT NOT NULL,
      store_name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS music_posts (
      id SERIAL PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      store_name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure fallback columns or updates exist
  try {
    await connection.query("ALTER TABLE web_menu_items ADD COLUMN is_signature BOOLEAN NOT NULL DEFAULT FALSE");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_menu_items MODIFY COLUMN image TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_menu_items ADD COLUMN video_url TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN category VARCHAR(100) DEFAULT 'Q&A'");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN skin_type INT DEFAULT 1");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_store_licenses ADD COLUMN password VARCHAR(255) NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_brand_films ADD COLUMN category VARCHAR(50) DEFAULT 'THEATER'");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_interior_layouts ADD COLUMN video_links TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_interior_layouts ADD COLUMN default_video_links TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE music_songs ADD COLUMN lyrics TEXT NULL");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE music_songs ADD COLUMN visible BOOLEAN DEFAULT TRUE");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE music_songs ADD COLUMN order_index INT NOT NULL DEFAULT 0");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN is_notice BOOLEAN DEFAULT FALSE");
  } catch (_) {}
  try {
    await connection.query("ALTER TABLE web_board_posts ADD COLUMN like_count INT DEFAULT 0");
  } catch (_) {}

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_post_likes (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL,
      member_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_post_member_like UNIQUE (post_id, member_id)
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS web_system_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await connection.query(`
      INSERT INTO web_system_settings (setting_key, setting_value) 
      VALUES ('draft_random_show', 'false') 
      ON CONFLICT (setting_key) DO NOTHING
    `);
  } catch (_) {}

  // 3. Populate default records
  await seedInitialData(connection);

  // 4. PostgreSQL Sequence Sync & Auto-Heal Mechanism (Resolves sequence out of sync constraints)
  const tablesToSync = [
    'web_membership_users',
    'web_membership_consultations',
    'web_board_posts',
    'web_board_attachments',
    'web_board_comments',
    'web_admin_accounts',
    'web_home_main',
    'web_interior_layouts',
    'web_brand_films',
    'web_brand_sounds',
    'web_store_licenses',
    'web_verify_logs',
    'web_grade_permissions',
    'music_songs',
    'music_covers',
    'music_playlists',
    'music_comments',
    'music_posts',
    'web_post_likes'
  ];

  for (const table of tablesToSync) {
    try {
      const [seqInfoRes]: any = await connection.query(`
        SELECT pg_get_serial_sequence('${table}', 'id') as seq_name
      `);
      const seqName = seqInfoRes?.[0]?.seq_name || seqInfoRes?.[0]?.SEQ_NAME;
      if (seqName) {
        console.log(`[DB Sequence Auto-Heal] Syncing sequence for ${table} (${seqName})...`);
        await connection.query(`
          SELECT setval('${seqName}', COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)
        `);
      }
    } catch (err: any) {
      console.warn(`[DB Sequence Auto-Heal Warn] Table ${table} sequence sync skipped or generic database dial:`, err.message);
    }
  }
}
