import { FullClassData, ClassSummary, StudentEntry, DocumentProof, DatabaseBackup } from '../types';
import { DEFAULT_SCHOOL_NAME } from '../constants';
import { FirebaseDbService } from './firebaseDb';

const DB_NAME = 'WaliKelasRekapDB';
const DB_VERSION = 1;
const STORE_CLASSES = 'classes';
const CURRENT_ACTIVE_KEY = 'active_class_id';

export class DatabaseService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  public static getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_CLASSES)) {
            const store = db.createObjectStore(STORE_CLASSES, { keyPath: 'summary.id' });
            store.createIndex('className', 'summary.className', { unique: false });
            store.createIndex('updatedAt', 'summary.updatedAt', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('IndexedDB error:', request.error);
          reject(request.error);
        };
      });
    }
    return this.dbPromise;
  }

  public static async getAllClasses(): Promise<FullClassData[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_CLASSES, 'readonly');
        const store = transaction.objectStore(STORE_CLASSES);
        const request = store.getAll();

        request.onsuccess = () => {
          const result = request.result as FullClassData[];
          // Sort by updatedAt descending
          result.sort((a, b) => new Date(b.summary.updatedAt).getTime() - new Date(a.summary.updatedAt).getTime());
          resolve(result);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Fallback to localStorage on IndexedDB error', e);
      const raw = localStorage.getItem('walikelas_classes_fallback');
      return raw ? JSON.parse(raw) : [];
    }
  }

  public static async getClassById(id: string): Promise<FullClassData | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_CLASSES, 'readonly');
        const store = transaction.objectStore(STORE_CLASSES);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Fallback getClassById error', e);
      const all = await this.getAllClasses();
      return all.find(c => c.summary.id === id) || null;
    }
  }

  public static async saveClass(data: FullClassData, syncToCloud: boolean = true): Promise<void> {
    const updatedData: FullClassData = {
      ...data,
      summary: {
        ...data.summary,
        updatedAt: new Date().toISOString()
      }
    };

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_CLASSES, 'readwrite');
        const store = transaction.objectStore(STORE_CLASSES);
        const request = store.put(updatedData);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Save fallback in localStorage (lightweight copy)
      try {
        const allClasses = await this.getAllClasses();
        localStorage.setItem('walikelas_active_class_id', data.summary.id);
        const mini = allClasses.map(c => ({
          id: c.summary.id,
          className: c.summary.className,
          teacherName: c.summary.teacherName,
          updatedAt: c.summary.updatedAt
        }));
        localStorage.setItem('walikelas_classes_index', JSON.stringify(mini));
      } catch (err) {
        // ignore storage limits
      }

      // Sync to Firebase Firestore in the background
      if (syncToCloud) {
        FirebaseDbService.saveClass(updatedData).catch((err) => {
          console.warn('Background sync to Firestore skipped or failed:', err);
        });
      }
    } catch (e) {
      console.error('Error saving to IndexedDB:', e);
      throw e;
    }
  }

  public static async deleteClass(id: string): Promise<void> {
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_CLASSES, 'readwrite');
      const store = transaction.objectStore(STORE_CLASSES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Delete from Firestore
    FirebaseDbService.deleteClass(id).catch((err) => {
      console.warn('Firestore delete class notice:', err);
    });
  }

  public static getActiveId(): string | null {
    return localStorage.getItem('walikelas_active_class_id');
  }

  public static setActiveId(id: string): void {
    localStorage.setItem('walikelas_active_class_id', id);
  }

  public static async clearAllData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_CLASSES, 'readwrite');
      const store = transaction.objectStore(STORE_CLASSES);
      const request = store.clear();

      request.onsuccess = () => {
        localStorage.removeItem('walikelas_active_class_id');
        localStorage.removeItem('walikelas_classes_index');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static createDefaultClass(): FullClassData {
    const id = 'class_' + Date.now();
    const now = new Date().toISOString().split('T')[0];
    
    const initialSummary: ClassSummary = {
      id,
      schoolName: DEFAULT_SCHOOL_NAME,
      academicYear: '2025/2026',
      semester: 'Ganjil',
      className: '7A',
      teacherName: 'MUSTOFA',
      maleCount: 0,
      femaleCount: 0,
      statementPlace: 'Jatibarang',
      statementDate: now,
      statementAgreed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      summary: initialSummary,
      students: [],
      generalDocuments: []
    };
  }

  public static async exportBackupJSON(): Promise<string> {
    const allClasses = await this.getAllClasses();
    const backup: DatabaseBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Aplikasi Rekapitulasi Data Wali Kelas',
      data: allClasses
    };
    return JSON.stringify(backup, null, 2);
  }

  public static async importBackupJSON(jsonStr: string): Promise<number> {
    try {
      const parsed: DatabaseBackup = JSON.parse(jsonStr);
      if (!parsed.data || !Array.isArray(parsed.data)) {
        throw new Error('Format file backup tidak valid!');
      }

      for (const item of parsed.data) {
        if (item.summary && item.summary.id) {
          await this.saveClass(item);
        }
      }
      return parsed.data.length;
    } catch (e: any) {
      throw new Error(e.message || 'Gagal mengimpor data backup');
    }
  }
}
