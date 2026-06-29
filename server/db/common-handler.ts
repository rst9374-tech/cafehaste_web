import fs from 'fs';
import path from 'path';
import { getDbPool } from '../database';

/**
 * Executes DB operations inside a managed connection context.
 * This guarantees "Minimum Hold, Immediate Release" of maximum 30 concurrent database connections.
 */
export async function withDbConnection<T>(callback: (connection: any) => Promise<T>): Promise<T> {
  const dbPool = await getDbPool();
  if (dbPool && dbPool.isFallback) {
    return await callback(dbPool);
  }
  try {
    const connection = await dbPool.getConnection();
    try {
      return await callback(connection);
    } finally {
      connection.release(); // Instant pool connection release (anti-leak protection)
    }
  } catch (err: any) {
    console.warn('[DB Context Error] Failed to execute DB context:', err.message);
    const errMsg = err.message || '';
    if (
      errMsg.includes('ETIMEDOUT') || 
      errMsg.includes('ENOTFOUND') || 
      errMsg.includes('ECONNREFUSED') || 
      errMsg.includes('lost') || 
      errMsg.includes('closed') || 
      errMsg.includes('Handshake')
    ) {
      console.warn('[DB Context Info] Triggering forced fallback to local database simulator due to connection issues.');
      try {
        const { forceFallbackToLocalSimulator } = await import('../database');
        forceFallbackToLocalSimulator();
      } catch (importErr) {
        console.error('[DB Context Error] Could not trigger forced fallback:', importErr);
      }
      // Retry with local simulator
      const fallbackPool = await getDbPool();
      return await callback(fallbackPool);
    }
    throw err;
  }
}

/**
 * Reads local checkpoint backups list from a file.
 */
export function getLocalCheckpoints(filename: string): any[] {
  const filePath = path.join(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`[Checkpoint Error] Failed to parse file ${filename}:`, e);
      return [];
    }
  }
  return [];
}

/**
 * Saves a new backup checkpoint snapshot to disk.
 * Retains maximum 3 records.
 */
export async function saveLocalCheckpoint(
  filename: string,
  prefix: string,
  countFields: Record<string, number>,
  snapshotData: Record<string, any>
): Promise<any[]> {
  const filePath = path.join(process.cwd(), filename);
  let list = getLocalCheckpoints(filename);

  const timestamp = new Date().toISOString();
  const newCheckpoint = {
    id: `${prefix}_${Date.now()}`,
    savedAt: timestamp,
    ...countFields,
    ...snapshotData
  };

  list.unshift(newCheckpoint);
  list = list.slice(0, 3); // Retain max 3 checkpoints

  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');

  return list;
}

/**
 * Deletes a backup checkpoint snapshot from disk.
 */
export async function deleteLocalCheckpoint(filename: string, checkpointId: string): Promise<any[]> {
  const filePath = path.join(process.cwd(), filename);
  let list = getLocalCheckpoints(filename);
  list = list.filter((item: any) => item.id !== checkpointId);

  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');

  return list;
}

/**
 * Safe JSON parsing helper to protect against bad inputs.
 */
export function safeParseJson(jsonStr: any, fallback: any = []): any {
  if (jsonStr === null || jsonStr === undefined) return fallback;
  if (typeof jsonStr !== 'string') return jsonStr;
  if (jsonStr.trim() === '') return fallback;
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return fallback;
  }
}
