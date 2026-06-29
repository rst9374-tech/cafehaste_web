import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { FallbackDbPool } from './db/simulator';
import { setupDatabaseSchema } from './db/schema-setup';
import { formatSql, translateSqlToPg } from './db/dialect-translator';
import { saveBase64ToFile } from './db/asset-helper';

// Re-exports of backing caches & file IO systems
export {
  BACKUP_DB_FILE,
  BACKUP_ADMIN_FILE,
  BACKUP_DRAFTS_FILE,
  BACKUP_INTERIORS_FILE,
  BACKUP_CONSULTATIONS_FILE,
  BACKUP_CATEGORIES_FILE,
  BACKUP_MENU_ITEMS_FILE,
  BACKUP_FILMS_FILE,
  BACKUP_LICENSES_FILE,
  BACKUP_SOUNDS_FILE,
  dbCache,
  readJsonFile,
  writeJsonFile,
  readBackupLicenses,
  writeBackupLicenses,
  readBackupFilms,
  writeBackupFilms,
  readBackupCategories,
  writeBackupCategories,
  readBackupMenuItems,
  writeBackupMenuItems,
  readBackupDb,
  writeBackupDb,
  readBackupConsultations,
  writeBackupConsultations,
  readBackupAdmins,
  writeBackupAdmins,
  readBackupDrafts,
  writeBackupDrafts,
  readBackupInteriors,
  writeBackupInteriors,
  readBackupSounds,
  writeBackupSounds,
  verifyApiLogs,
  addVerifyLog,
  storeVerifyCache,
  clearVerifyApiLogs,
  getAvailableLogDays,
  getKstTimeInfo,
  flushPendingLogs,
  pendingLogBuffer,
  getLogStatusType
} from './db/cache-io';

export {
  BACKUP_POSTS_GUIDE_FILE,
  BACKUP_POSTS_COOP_FILE,
  BACKUP_POSTS_AS_FILE,
  BACKUP_POSTS_QNA_FILE,
  BACKUP_POSTS_NOTICE_FILE,
  BACKUP_ATTACHMENTS_FILE,
  BACKUP_COMMENTS_FILE,
  boardCache,
  readBackupPosts,
  writeBackupPosts,
  readBackupAttachments,
  writeBackupAttachments,
  readBackupComments,
  writeBackupComments,
  readBackupPermissions,
  writeBackupPermissions
} from './db/board_io';

export type { StoreVerifyCacheItem } from './db/cache-io';

// Re-exports of Simulators
export { FallbackDbPool } from './db/simulator';

// Re-exports of Helpers
export { formatSql, translateSqlToPg } from './db/dialect-translator';
export { saveBase64ToFile, convertExistingBase64ToFiles } from './db/asset-helper';
export { overrideQueryResultWithLocalBackup } from './db/local-override';

// Configuration details for Supabase connection
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || 'placeholder-key').trim();

export let pool: any = null;
export let isCloudSqlConnected = false;
export let dbType: 'supabase_rpc' | 'supabase_direct' | 'fallback' = 'fallback';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function syncDraftsBackup() {
  try {
    const dbPool = await getDbPool();
    const [rows]: any = await dbPool.query('SELECT * FROM web_home_main ORDER BY order_index ASC, id ASC');
    const { dbCache, writeBackupDrafts } = await import('./db/cache-io');
    dbCache.drafts = rows;
    writeBackupDrafts(rows);

    if (typeof (global as any).flushPublicReadCache === 'function') {
      (global as any).flushPublicReadCache();
    }
  } catch (err) {
    console.error('[Sync Drafts Backup Error]', err);
  }
}

class SupabaseRpcPool {
  isFallback = false;

  async getConnection() {
    return {
      query: async (sql: string, params: any[] = []) => {
        return this.query(sql, params);
      },
      release: () => {}
    };
  }

  async query(sql: string, params: any[] = []) {
    const formatted = formatSql(sql, params);
    const pgSql = translateSqlToPg(formatted);
    
    if (sql.toUpperCase().trim() === 'SELECT 1') {
      return [[{ test: 1 }]];
    }

    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: pgSql });
      
      if (error) {
        console.error(`[Supabase RPC Error] (Query: ${pgSql}):`, error.message);
        throw error;
      }

      let rows: any[] = [];
      let metadata: any = {};

      if (Array.isArray(data)) {
        rows = data;
      } else if (data && typeof data === 'object') {
        if (data.status === 'success') {
          metadata = { affectedRows: 1 };
        } else {
          rows = [data];
        }
      }

      if (pgSql.toUpperCase().includes('RETURNING ID') && rows.length > 0) {
        const generatedId = rows[0].id || rows[0].ID;
        if (generatedId) {
          metadata = { insertId: generatedId, affectedRows: 1 };
        }
      }

      const finalResult = Object.keys(metadata).length > 0 ? metadata : rows;
      return [finalResult, []];
    } catch (err: any) {
      const isCudQuery = pgSql.toUpperCase().startsWith('INSERT') || 
                         pgSql.toUpperCase().startsWith('UPDATE') || 
                         pgSql.toUpperCase().startsWith('DELETE');
      
      if (isCudQuery) {
        console.error(`[Supabase Query Failed] CUD operation failed on production database:`, err.message);
        throw err;
      }
      
      console.warn(`[Supabase Query Interceptor Failed] routing lookup to locally persisted databases:`, err.message);
      const fallback = new FallbackDbPool();
      return fallback.query(sql, params);
    }
  }

  async execute(sql: string, params: any[] = []) {
    return this.query(sql, params);
  }

  async end() {
    console.log('[Supabase RPC Connection Pool] Shutting down connection layers.');
  }
}

class SupabasePgPool {
  private pgPool: pg.Pool;

  constructor(config: pg.PoolConfig) {
    this.pgPool = new pg.Pool(config);
    this.pgPool.on('error', (err) => {
      console.error('[Supabase PG Pool Internal Error]', err);
    });
  }

  async getConnection() {
    const client = await this.pgPool.connect();
    return {
      query: async (sql: string, params: any[] = []) => {
        const formatted = formatSql(sql, params);
        const pgSql = translateSqlToPg(formatted);
        const res = await client.query(pgSql);
        
        let rows = res.rows;
        let metadata: any = {};
        
        if (pgSql.toUpperCase().startsWith('INSERT') && rows.length > 0) {
          const generatedId = rows[0].id || rows[0].insertid || rows[0].insertId;
          if (generatedId) {
            metadata = { insertId: generatedId, affectedRows: 1 };
          }
        }
        
        const finalResult = Object.keys(metadata).length > 0 ? metadata : rows;
        return [finalResult, []];
      },
      release: () => {
        client.release();
      }
    };
  }

  async query(sql: string, params: any[] = []) {
    const conn = await this.getConnection();
    try {
      const result = await conn.query(sql, params);
      return result;
    } finally {
      conn.release();
    }
  }

  async execute(sql: string, params: any[] = []) {
    return this.query(sql, params);
  }

  async end() {
    await this.pgPool.end();
    console.log('[Supabase PG Connection Pool] Shutting down connection layers.');
  }
}

export async function getDbPool(forceReconnect = false) {
  const hasCloudEnv = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
  if (process.env.NODE_ENV !== 'production' && !hasCloudEnv) {
    if (!pool || pool.isFallback === false) {
      console.log('[DB Initialization] Local Development Mode: Forcing fallback to local simulator...');
      pool = new FallbackDbPool();
      dbType = 'fallback';
      isCloudSqlConnected = false;
    }
    return pool;
  }

  if (forceReconnect || !pool) {
    console.log('[DB Initialization] Connecting to Supabase ecosystem...');

    try {
      let directHost = process.env.DB_HOST || 'db.fuzhdcsdfblwcgwfylsx.supabase.co';
      if (!process.env.DB_HOST && process.env.DB_USER && process.env.DB_USER.includes('.')) {
        const parts = process.env.DB_USER.split('.');
        directHost = `db.${parts[parts.length - 1]}.supabase.co`;
      }

      console.log(`[DB Initialization] Attempting direct pg connection on host: ${directHost}...`);
      const pgConfig: pg.PoolConfig = {
        host: directHost,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        ssl: { rejectUnauthorized: false },
        max: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 30
      };

      const testPoolConnection = new pg.Pool({ ...pgConfig, max: 1 });
      const testClient = await testPoolConnection.connect();
      await testClient.query('SELECT 1');
      testClient.release();
      await testPoolConnection.end();

      console.log('[DB Initialization Success] Successfully authenticated with live Supabase Database directly using SSL PostgreSQL tunnel!');
      pool = new SupabasePgPool(pgConfig);
      dbType = 'supabase_direct';
      isCloudSqlConnected = true;

      const conn = await pool.getConnection();
      await setupDatabaseSchema(conn, 'postgres');
      console.log('[DB Seeding] Schema setup and updates synced successfully across Supabase Tables!');
      conn.release();

    } catch (pgDirectErr: any) {
      console.warn(`[DB Initialization Warning] Direct pg connection failed: ${pgDirectErr.message || pgDirectErr}`);
    }

    try {
      if (!pool) {
        console.log('[DB Initialization] Executing network check for Supabase HTTP REST RPC API...');
        const { data, error } = await supabase.rpc('exec_sql', { query: 'SELECT 1 as ping' });
        
        if (error) {
          if (error.message.includes('Could not find the function') || error.message.includes('does not exist')) {
            console.warn('[DB Initialization Warning] Supabase REST client loaded but RPC function "exec_sql" is missing.');
          } else {
            console.warn('[DB Initialization Warning] Supabase RPC execution threw exception:', error.message);
          }
          throw error;
        }

        console.log('[DB Initialization Success] Successfully connected to Supabase REST RPC tunnel!');
        pool = new SupabaseRpcPool();
        dbType = 'supabase_rpc';
        isCloudSqlConnected = true;

        const conn = await pool.getConnection();
        await setupDatabaseSchema(conn, 'postgres');
        console.log('[DB Seeding] Schema setup and updates synced successfully via REST RPC!');
        conn.release();
      }

    } catch (rpcErr: any) {
      if (!pool) {
        console.warn('[DB Connection Warn] Supabase default credentials verification deferred.');
        console.warn('[DB Connection Fallback] Defaulting app runtime to high-fidelity Local Database Simulator representation.');
        pool = new FallbackDbPool();
        dbType = 'fallback';
        isCloudSqlConnected = false;
      }
    }
  }

  return pool;
}

export function forceFallbackToLocalSimulator() {
  console.warn('[DB Fallback Utility] Forced fallback to local simulator triggered instantly.');
  pool = new FallbackDbPool();
  isCloudSqlConnected = false;
  dbType = 'fallback';
}
