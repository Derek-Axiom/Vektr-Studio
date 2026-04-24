import { useState, useCallback } from 'react';
import { encodeFloat32Wav } from '../utils';
import { LOCKED_SAMPLE_RATE } from '../useOmniRack';

// ─── Database ─────────────────────────────────────────────────────────────────

const SESSION_DB_NAME = 'vektr_sessions_db';
const SESSION_STORE = 'sessions';
const SESSION_DB_VERSION = 1;

export interface SessionManifest {
  sessionId: string;
  startTime: number;
  status: 'active' | 'complete';
  opfsFile: string;
  lastChunkCount: number;
  lastHeartbeat: number;
}

function openSessionDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SESSION_DB_NAME, SESSION_DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'sessionId' });
      }
    };
  });
}

function idbPut(db: IDBDatabase, manifest: SessionManifest): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, 'readwrite');
    const req = tx.objectStore(SESSION_STORE).put(manifest);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(db: IDBDatabase): Promise<SessionManifest[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, 'readonly');
    const req = tx.objectStore(SESSION_STORE).getAll();
    req.onsuccess = () => resolve(req.result as SessionManifest[]);
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(db: IDBDatabase, sessionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, 'readwrite');
    const req = tx.objectStore(SESSION_STORE).delete(sessionId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── OPFS Helper ──────────────────────────────────────────────────────────────

async function readOpfsFile(filename: string): Promise<Float32Array | null> {
  try {
    if (!('storage' in navigator) || typeof (navigator.storage as any)?.getDirectory !== 'function') {
      return null;
    }
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const buffer = await file.arrayBuffer();
    return new Float32Array(buffer);
  } catch {
    return null; // File may not exist if ChunkWriter used memory mode
  }
}

async function deleteOpfsFile(filename: string): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(filename);
  } catch { /* non-fatal */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface RecoveredSession {
  sessionId: string;
  startTime: number;
  durationSec: number;
  blob: Blob;
}

export interface UseSessionGuardReturn {
  /** Orphaned sessions available for recovery. Check on mount. */
  recoveredSessions: RecoveredSession[];
  /** Call when recording starts. Writes the active manifest. */
  openSession: (sessionId: string, opfsFile: string) => Promise<void>;
  /** Update chunk count periodically so recovery can estimate duration. */
  heartbeat: (sessionId: string, chunkCount: number) => Promise<void>;
  /** Call when recording completes normally. Marks session complete. */
  closeSession: (sessionId: string) => Promise<void>;
  /** Dismiss a recovered session and delete its data. */
  dismissRecovery: (sessionId: string) => void;
  /** Run on app start to find and reconstruct any crashed sessions. */
  checkForCrashedSessions: () => Promise<void>;
}

/**
 * useSessionGuard - Crash Recovery & State Persistence
 *
 * Tracks active recording sessions in IndexedDB. If the OS kills the app,
 * browser tab, or the process crashes mid-recording, the session manifest
 * survives. On the next launch, checkForCrashedSessions() finds any orphaned
 * 'active' sessions, reads their OPFS .pcm files back, encodes them to WAV,
 * and surfaces them as recoveredSessions for the UI to offer the user.
 *
 * Only activates the OPFS recovery path. If ChunkWriter fell back to in-memory
 * mode (OPFS unavailable), there is nothing to recover - the in-memory chunks
 * are gone with the process. This is the correct and honest behavior.
 */
export function useSessionGuard(): UseSessionGuardReturn {
  const [recoveredSessions, setRecoveredSessions] = useState<RecoveredSession[]>([]);

  const openSession = useCallback(async (sessionId: string, opfsFile: string): Promise<void> => {
    try {
      const db = await openSessionDb();
      await idbPut(db, {
        sessionId,
        startTime: Date.now(),
        status: 'active',
        opfsFile,
        lastChunkCount: 0,
        lastHeartbeat: Date.now(),
      });
    } catch (err) {
      console.warn('useSessionGuard: Failed to write session manifest.', err);
    }
  }, []);

  const heartbeat = useCallback(async (sessionId: string, chunkCount: number): Promise<void> => {
    try {
      const db = await openSessionDb();
      const all = await idbGetAll(db);
      const manifest = all.find((m) => m.sessionId === sessionId);
      if (!manifest || manifest.status !== 'active') return;
      await idbPut(db, { ...manifest, lastChunkCount: chunkCount, lastHeartbeat: Date.now() });
    } catch { /* non-fatal - heartbeat is best-effort */ }
  }, []);

  const closeSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const db = await openSessionDb();
      const all = await idbGetAll(db);
      const manifest = all.find((m) => m.sessionId === sessionId);
      if (!manifest) return;
      // Mark complete - will be ignored by checkForCrashedSessions
      await idbPut(db, { ...manifest, status: 'complete' });
      // Clean up after a short delay to avoid racing with the file read in ChunkWriter
      setTimeout(async () => {
        try { await idbDelete(db, sessionId); } catch { /* non-fatal */ }
      }, 3000);
    } catch (err) {
      console.warn('useSessionGuard: Failed to close session manifest.', err);
    }
  }, []);

  const dismissRecovery = useCallback((sessionId: string): void => {
    setRecoveredSessions((prev) => {
      const session = prev.find((s) => s.sessionId === sessionId);
      if (session) {
        // Clean up the orphaned OPFS file and manifest asynchronously
        openSessionDb().then((db) => {
          idbDelete(db, sessionId).catch(() => {});
        }).catch(() => {});
      }
      return prev.filter((s) => s.sessionId !== sessionId);
    });
  }, []);

  const checkForCrashedSessions = useCallback(async (): Promise<void> => {
    try {
      const db = await openSessionDb();
      const all = await idbGetAll(db);
      const crashed = all.filter((m) => m.status === 'active');

      if (crashed.length === 0) return;

      const recovered: RecoveredSession[] = [];

      for (const manifest of crashed) {
        const samples = await readOpfsFile(manifest.opfsFile);

        if (samples && samples.length > 0) {
          const blob = encodeFloat32Wav([samples], LOCKED_SAMPLE_RATE);
          // Estimate duration from chunk count (128 samples/chunk at 44100 Hz)
          const durationSec = Math.round((manifest.lastChunkCount * 128) / LOCKED_SAMPLE_RATE);

          recovered.push({
            sessionId: manifest.sessionId,
            startTime: manifest.startTime,
            durationSec,
            blob,
          });

          // Clean up the OPFS file - already in-memory as WAV blob
          await deleteOpfsFile(manifest.opfsFile);
        } else {
          // No OPFS data (memory-mode session, not recoverable) - just clean up
          await idbDelete(db, manifest.sessionId);
        }
      }

      if (recovered.length > 0) {
        setRecoveredSessions(recovered);
      }
    } catch (err) {
      console.warn('useSessionGuard: Crash recovery check failed.', err);
    }
  }, []);

  return {
    recoveredSessions,
    openSession,
    heartbeat,
    closeSession,
    dismissRecovery,
    checkForCrashedSessions,
  };
}

