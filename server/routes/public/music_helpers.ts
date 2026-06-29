import fs from 'fs';
import path from 'path';

// Paths to local JSON databases
export const songsJsonPath = path.join(process.cwd(), 'local_music_songs.json');
export const coversJsonPath = path.join(process.cwd(), 'local_music_covers.json');
const playlistsJsonPath = path.join(process.cwd(), 'local_music_playlists.json');
export const commentsJsonPath = path.join(process.cwd(), 'local_music_comments.json');
export const postsJsonPath = path.join(process.cwd(), 'local_music_posts.json');

// Helper to safely read JSON backups
export function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.warn(`[JSON DB Warn] Failed to read ${path.basename(filePath)}:`, err);
  }
  return defaultValue;
}

// Helper to safely write JSON backups
export function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[JSON DB Error] Failed to write ${path.basename(filePath)}:`, err);
  }
}
