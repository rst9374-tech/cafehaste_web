import fs from 'fs';
import path from 'path';
import * as serverDefaults from '../../serverDefaults';

// Ensure uploads directory exists on disk for hosting uploaded design assets and blueprints
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Persistent JSON file backup path
export const BACKUP_DB_FILE = path.join(process.cwd(), 'local_members.json');
export const BACKUP_ADMIN_FILE = path.join(process.cwd(), 'local_admins.json');
export const BACKUP_DRAFTS_FILE = path.join(process.cwd(), 'local_hero_drafts.json');
export const BACKUP_INTERIORS_FILE = path.join(process.cwd(), 'local_interiors.json');
export const BACKUP_CONSULTATIONS_FILE = path.join(process.cwd(), 'local_consultations.json');
export const BACKUP_CATEGORIES_FILE = path.join(process.cwd(), 'local_menu_categories.json');
export const BACKUP_MENU_ITEMS_FILE = path.join(process.cwd(), 'local_menu_items.json');
export const BACKUP_FILMS_FILE = path.join(process.cwd(), 'local_films.json');
export const BACKUP_LICENSES_FILE = path.join(process.cwd(), 'local_licenses.json');
export const BACKUP_SOUNDS_FILE = path.join(process.cwd(), 'local_sounds.json');

// In-Memory Caching (Greatly reduces traffic load)
export const dbCache: {
  members: any[] | null;
  admins: any[] | null;
  drafts: any[] | null;
  interiors: any[] | null;
  consultations: any[] | null;
  categories: any[] | null;
  menuItems: any[] | null;
  films: any[] | null;
  licenses: any[] | null;
  sounds: any[] | null;
} = {
  members: null,
  admins: null,
  drafts: null,
  interiors: null,
  consultations: null,
  categories: null,
  menuItems: null,
  films: null,
  licenses: null,
  sounds: null,
};

export function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error(`[Read Error] ${filePath}`, err);
  }
  return defaultValue;
}

export function writeJsonFile<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Write Error] ${filePath}`, err);
  }
}

const DEFAULT_LICENSES = serverDefaults.DEFAULT_LICENSES;
const DEFAULT_CATEGORIES = serverDefaults.DEFAULT_CATEGORIES;
const DEFAULT_MENU_ITEMS = serverDefaults.DEFAULT_MENU_ITEMS;
const DEFAULT_FILMS = serverDefaults.DEFAULT_FILMS;
const DEFAULT_DRAFTS = serverDefaults.DEFAULT_DRAFTS;
const DEFAULT_INTERIORS = serverDefaults.DEFAULT_INTERIORS;
const DEFAULT_CONSULTATIONS = serverDefaults.DEFAULT_CONSULTATIONS;
const DEFAULT_ADMINS = serverDefaults.DEFAULT_ADMINS;
const DEFAULT_SOUNDS = (serverDefaults as any).DEFAULT_SOUNDS || [];

export function readBackupLicenses(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.licenses !== null) return dbCache.licenses;
  dbCache.licenses = readJsonFile<any[]>(BACKUP_LICENSES_FILE, DEFAULT_LICENSES);
  return dbCache.licenses;
}

export function writeBackupLicenses(licenses: any[]) {
  dbCache.licenses = licenses;
  writeJsonFile(BACKUP_LICENSES_FILE, licenses);
}

export function readBackupFilms(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.films !== null) return dbCache.films;
  const data = readJsonFile<any[]>(BACKUP_FILMS_FILE, DEFAULT_FILMS);
  if (!Array.isArray(data) || data.length === 0) {
    dbCache.films = DEFAULT_FILMS;
    writeBackupFilms(DEFAULT_FILMS);
    return dbCache.films;
  }
  dbCache.films = data;
  return dbCache.films;
}

export function writeBackupFilms(films: any[]) {
  dbCache.films = films;
  writeJsonFile(BACKUP_FILMS_FILE, films);
}



export function readBackupCategories(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.categories !== null) return dbCache.categories;
  dbCache.categories = readJsonFile<any[]>(BACKUP_CATEGORIES_FILE, DEFAULT_CATEGORIES);
  return dbCache.categories;
}

export function writeBackupCategories(categories: any[]) {
  dbCache.categories = categories;
  writeJsonFile(BACKUP_CATEGORIES_FILE, categories);
}

export function readBackupMenuItems(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.menuItems !== null) return dbCache.menuItems;
  const items = readJsonFile<any[]>(BACKUP_MENU_ITEMS_FILE, DEFAULT_MENU_ITEMS);
  
  const uniqueMap = new Map<string, any>();
  for (const item of items) {
    const existing = uniqueMap.get(item.id);
    if (!existing) {
      uniqueMap.set(item.id, item);
    } else {
      const hasBetterData = (item.nameKr && item.price) && (!existing.nameKr || !existing.price);
      if (hasBetterData) {
        uniqueMap.set(item.id, item);
      }
    }
  }
  dbCache.menuItems = Array.from(uniqueMap.values());
  return dbCache.menuItems;
}

export function writeBackupMenuItems(items: any[]) {
  dbCache.menuItems = items;
  writeJsonFile(BACKUP_MENU_ITEMS_FILE, items);
}

export function readBackupDb(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.members !== null) return dbCache.members;
  dbCache.members = readJsonFile<any[]>(BACKUP_DB_FILE, []);
  return dbCache.members;
}

export function writeBackupDb(members: any[]) {
  dbCache.members = members;
  writeJsonFile(BACKUP_DB_FILE, members);
}

export function readBackupConsultations(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.consultations !== null) return dbCache.consultations;
  dbCache.consultations = readJsonFile<any[]>(BACKUP_CONSULTATIONS_FILE, DEFAULT_CONSULTATIONS);
  return dbCache.consultations;
}

export function writeBackupConsultations(consultations: any[]) {
  dbCache.consultations = consultations;
  writeJsonFile(BACKUP_CONSULTATIONS_FILE, consultations);
}

export function readBackupAdmins(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.admins !== null) return dbCache.admins;
  dbCache.admins = readJsonFile<any[]>(BACKUP_ADMIN_FILE, DEFAULT_ADMINS);
  return dbCache.admins;
}

export function writeBackupAdmins(admins: any[]) {
  dbCache.admins = admins;
  writeJsonFile(BACKUP_ADMIN_FILE, admins);
}

export function readBackupDrafts(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.drafts !== null) return dbCache.drafts;
  try {
    if (fs.existsSync(BACKUP_DRAFTS_FILE)) {
      const fileContent = fs.readFileSync(BACKUP_DRAFTS_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (parsed.length > 0 && parsed[0].tag && (parsed[0].tag.includes('CERAMIC') || parsed[0].tag.includes('NEW DESIGN'))) {
        try { fs.unlinkSync(BACKUP_DRAFTS_FILE); } catch(ex) {}
        dbCache.drafts = DEFAULT_DRAFTS;
        return dbCache.drafts;
      }
      
      let isHealed = false;
      const healed = parsed.map((d: any) => {
        const nextD = { ...d };
        if (nextD.bg_image && !nextD.bgImage) nextD.bgImage = nextD.bg_image;
        if (nextD.bgImage && !nextD.bg_image) nextD.bg_image = nextD.bgImage;

        const bg = nextD.bg_image;
        const isInvalid = !bg || bg === 'null' || bg === 'undefined' || bg.trim() === '';
        if (isInvalid) {
          const correspondingDefault = DEFAULT_DRAFTS.find(def => def.id === d.id);
          if (correspondingDefault) {
            isHealed = true;
            nextD.bg_image = correspondingDefault.bg_image;
            nextD.bgImage = correspondingDefault.bg_image;
          }
        }
        return nextD;
      });
      if (isHealed) {
        dbCache.drafts = healed;
        writeBackupDrafts(healed);
      } else {
        dbCache.drafts = healed;
      }
      return dbCache.drafts;
    }
  } catch (err) {
    console.error('[Backup Drafts Read Error]', err);
  }
  dbCache.drafts = DEFAULT_DRAFTS;
  return dbCache.drafts;
}

export function writeBackupDrafts(drafts: any[]) {
  dbCache.drafts = drafts;
  writeJsonFile(BACKUP_DRAFTS_FILE, drafts);
}

export function readBackupInteriors(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.interiors !== null) return dbCache.interiors;
  try {
    if (fs.existsSync(BACKUP_INTERIORS_FILE)) {
      const fileContent = fs.readFileSync(BACKUP_INTERIORS_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      
      let isHealed = false;
      const healed = parsed.map((item: any) => {
        const mockInvalid = !item.mock_image || item.mock_image === 'null' || item.mock_image === 'undefined' || item.mock_image.trim() === '';
        const bpInvalid = !item.blueprint_image || item.blueprint_image === 'null' || item.blueprint_image === 'undefined' || item.blueprint_image.trim() === '';
        const galleryInvalid = !item.gallery || item.gallery === 'null' || item.gallery === '[]' || item.gallery === 'undefined';
        const videoInvalid = !item.video_links || item.video_links === 'null' || item.video_links === 'undefined' || item.video_links === '[]' || (typeof item.video_links === 'string' && item.video_links.trim() === '');
        
        if (mockInvalid || bpInvalid || galleryInvalid || videoInvalid) {
          const correspondingDefault = DEFAULT_INTERIORS.find(def => def.type_id === item.type_id || def.id === item.id);
          if (correspondingDefault) {
            isHealed = true;
            return {
              ...item,
              mock_image: mockInvalid ? correspondingDefault.mock_image : item.mock_image,
              blueprint_image: bpInvalid ? correspondingDefault.blueprint_image : item.blueprint_image,
              gallery: galleryInvalid ? correspondingDefault.gallery : item.gallery,
              video_links: videoInvalid ? correspondingDefault.video_links : item.video_links
            };
          }
        }
        return item;
      });
      if (isHealed) {
        dbCache.interiors = healed;
        writeBackupInteriors(healed);
      } else {
        dbCache.interiors = healed;
      }
      return dbCache.interiors;
    }
  } catch (err) {
    console.error('[Backup Interiors Read Error]', err);
  }
  dbCache.interiors = DEFAULT_INTERIORS;
  return dbCache.interiors;
}

export function writeBackupInteriors(interiors: any[]) {
  dbCache.interiors = interiors;
  writeJsonFile(BACKUP_INTERIORS_FILE, interiors);
}

export function readBackupSounds(): any[] {
  if (process.env.NODE_ENV === 'production' && dbCache.sounds !== null) return dbCache.sounds;
  const data = readJsonFile<any[]>(BACKUP_SOUNDS_FILE, DEFAULT_SOUNDS);
  if (!Array.isArray(data) || data.length === 0) {
    dbCache.sounds = DEFAULT_SOUNDS;
    writeBackupSounds(DEFAULT_SOUNDS);
    return dbCache.sounds;
  }
  dbCache.sounds = data;
  return dbCache.sounds;
}

export function writeBackupSounds(sounds: any[]) {
  dbCache.sounds = sounds;
  writeJsonFile(BACKUP_SOUNDS_FILE, sounds);
}

// Re-exports from verify-logger to preserve path backwards compatibility
export {
  verifyApiLogs,
  pendingLogBuffer,
  storeVerifyCache,
  clearVerifyApiLogs,
  flushPendingLogs,
  addVerifyLog,
  getAvailableLogDays,
  getKstTimeInfo,
  scheduleDailyLogCleanup,
  getLogStatusType
} from './verify-logger';

export type { StoreVerifyCacheItem } from './verify-logger';
