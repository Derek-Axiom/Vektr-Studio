const DB_NAME = 'vektr_studio_db';
const STORE_NAME = 'audio_blobs';
const ANALYSIS_STORE = 'analysis_data';
const DB_VERSION = 2; // bumped: added analysis_data store

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      // v2: sovereign analysis store - keeps onset arrays out of localStorage
      if (!db.objectStoreNames.contains(ANALYSIS_STORE)) {
        db.createObjectStore(ANALYSIS_STORE);
      }
    };
  });
}

export async function saveAudioFile(id: string, blob: Blob): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAudioFile(id: string): Promise<Blob | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAudioFile(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- ANALYSIS DATA STORE ---
// Keeps onset arrays, histograms, and suggestions in IndexedDB.
// These are large structured objects that would silently overflow localStorage.

export async function saveAnalysisData(id: string, data: object): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ANALYSIS_STORE, 'readwrite');
    const request = tx.objectStore(ANALYSIS_STORE).put(data, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAnalysisData<T = unknown>(id: string): Promise<T | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ANALYSIS_STORE, 'readonly');
    const request = tx.objectStore(ANALYSIS_STORE).get(id);
    request.onsuccess = () => resolve((request.result as T) || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAnalysisData(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ANALYSIS_STORE, 'readwrite');
    const request = tx.objectStore(ANALYSIS_STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Studio Sync Engine: Prepares the app for dual-layer syncing (Local + Future Auth Cloud)
const LOCAL_STORAGE_KEY = 'vektr_studio_profile';

export const SyncEngine = {
  load: <T>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch { return fallback; }
  },
  save: <T>(key: string, data: T) => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}${key}`, JSON.stringify(data));
      // Future architecture: push encrypted payload to authenticated sovereign cloud
    } catch (e) {
      console.error('Studio Sync failed to commit to determinism buffer', e);
    }
  }
};

