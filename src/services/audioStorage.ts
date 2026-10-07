/**
 * Subam Audio Vault - IndexedDB & Local Storage Manager
 * Enables instant, high-fidelity local audio playback for uploaded master tracks (.mp3, .wav, .m4a, .aac, .flac).
 * Persists audio blobs across page reloads without network latency.
 */

export interface StoredAudioRecord {
  slotId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  blob: Blob;
  updatedAt: number;
}

export interface StoredAudioMeta {
  slotId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  url: string;
  updatedAt: number;
}

const DB_NAME = 'SubamAudioVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'slot_audios';

class AudioStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeUrls: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'slotId' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save an uploaded music file for a slot
   */
  public async saveAudioFile(slotId: string, file: File): Promise<StoredAudioMeta> {
    const db = await this.getDB();
    const duration = await this.detectAudioDuration(file);

    // Revoke previous blob URL if exists
    if (this.activeUrls.has(slotId)) {
      try {
        URL.revokeObjectURL(this.activeUrls.get(slotId)!);
      } catch {}
    }

    const record: StoredAudioRecord = {
      slotId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'audio/mpeg',
      duration: duration || undefined,
      blob: file,
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => {
        const objectUrl = URL.createObjectURL(file);
        this.activeUrls.set(slotId, objectUrl);

        resolve({
          slotId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'audio/mpeg',
          duration: duration || undefined,
          url: objectUrl,
          updatedAt: record.updatedAt,
        });
      };

      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieve all uploaded audios as a map
   */
  public async getAllAudios(): Promise<Record<string, StoredAudioMeta>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const records: StoredAudioRecord[] = req.result || [];
          const map: Record<string, StoredAudioMeta> = {};

          records.forEach((rec) => {
            let url = this.activeUrls.get(rec.slotId);
            if (!url) {
              url = URL.createObjectURL(rec.blob);
              this.activeUrls.set(rec.slotId, url);
            }

            map[rec.slotId] = {
              slotId: rec.slotId,
              fileName: rec.fileName,
              fileSize: rec.fileSize,
              fileType: rec.fileType,
              duration: rec.duration,
              url,
              updatedAt: rec.updatedAt,
            };
          });

          resolve(map);
        };

        req.onerror = () => reject(req.error);
      });
    } catch {
      return {};
    }
  }

  /**
   * Remove an audio file for a slot
   */
  public async removeAudio(slotId: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (this.activeUrls.has(slotId)) {
        URL.revokeObjectURL(this.activeUrls.get(slotId)!);
        this.activeUrls.delete(slotId);
      }

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(slotId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {}
  }

  /**
   * Helper to detect audio duration from file
   */
  private detectAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        audio.src = url;

        audio.onloadedmetadata = () => {
          const dur = Math.round(audio.duration || 0);
          URL.revokeObjectURL(url);
          resolve(dur);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };

        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve(0);
        }, 3000);
      } catch {
        resolve(0);
      }
    });
  }
}

export const audioStorage = new AudioStorageService();
