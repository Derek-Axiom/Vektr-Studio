import { LOCKED_SAMPLE_RATE } from './useOmniRack';
import { encodeFloat32Wav } from './utils';

/**
 * ChunkWriter - Two-Tier Streaming Disk Write Engine
 *
 * Manages live PCM chunk streaming to disk during a recording session.
 * Prevents RAM exhaustion by writing Float32Array chunks to persistent
 * storage as they arrive from the AudioWorklet, rather than accumulating
 * them in-memory until stop.
 *
 * Tier 1 - OPFS (Origin Private File System):
 *   Uses the File System Access API to create a temporary .pcm file in
 *   the browser's private storage. Writes are sequentially queued so
 *   chunks never interleave. On close(), the raw bytes are read back,
 *   decoded to Float32Array, encoded to WAV, and the temp file is deleted.
 *
 * Tier 2 - In-Memory Accumulation (Fallback):
 *   Activated when OPFS is unavailable (older Android WebViews, restricted
 *   environments). Accumulates chunks in RAM exactly as before but provides
 *   the same API surface. The caller never needs to know which tier is active.
 */

export type ChunkWriterMode = 'opfs' | 'memory';

export class ChunkWriter {
  private mode: ChunkWriterMode | null = null;
  private sessionId = '';
  private chunkCount = 0;

  // OPFS state
  private opfsRoot: FileSystemDirectoryHandle | null = null;
  private opfsFileHandle: FileSystemFileHandle | null = null;
  private opfsWritable: FileSystemWritableFileStream | null = null;
  // Sequential write queue - ensures chunks land on disk in order.
  private writeQueue: Promise<void> = Promise.resolve();

  // In-memory fallback state
  private memChunks: Float32Array[] = [];

  /**
   * Opens a recording session. Must be called before write().
   * Returns the storage tier that was selected.
   */
  async open(sessionId: string): Promise<ChunkWriterMode> {
    this.sessionId = sessionId;
    this.chunkCount = 0;
    this.writeQueue = Promise.resolve();
    this.memChunks = [];

    // Attempt OPFS
    try {
      const storageHasDirectory =
        'storage' in navigator &&
        typeof (navigator.storage as any)?.getDirectory === 'function';

      if (storageHasDirectory) {
        const root = await navigator.storage.getDirectory();
        const filename = `vektr_rec_${sessionId}.pcm`;
        const fileHandle = await root.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable({ keepExistingData: false });

        this.opfsRoot = root;
        this.opfsFileHandle = fileHandle;
        this.opfsWritable = writable;
        this.mode = 'opfs';
        return 'opfs';
      }
    } catch (err) {
      console.warn('ChunkWriter: OPFS unavailable, using in-memory accumulation.', err);
    }

    this.mode = 'memory';
    return 'memory';
  }

  /**
   * Appends a Float32Array PCM chunk to the active session.
   * Fire-and-forget: the write is queued and does not block the caller.
   * Safe to call from the AudioWorklet onmessage handler at 44100 Hz cadence.
   */
  write(chunk: Float32Array): void {
    this.chunkCount++;

    if (this.mode === 'opfs' && this.opfsWritable) {
      // Slice to own ArrayBuffer - chunk.buffer may be a Transferable that
      // belongs to the Worklet message; we need a stable owned copy for the queue.
      const owned = chunk.buffer.slice(
        chunk.byteOffset,
        chunk.byteOffset + chunk.byteLength
      );

      this.writeQueue = this.writeQueue
        .then(() => this.opfsWritable!.write(owned))
        .catch((err) => {
          // If a write fails mid-session, degrade to in-memory for remaining chunks.
          console.warn('ChunkWriter: OPFS write failed, buffering remaining chunks.', err);
          this.memChunks.push(chunk);
        });
    } else {
      this.memChunks.push(chunk);
    }
  }

  /**
   * Finalizes the session and returns the encoded WAV blob.
   * Awaits all queued disk writes before reading back and encoding.
   * Deletes the temporary OPFS file after a successful read.
   */
  async close(): Promise<Blob> {
    if (
      this.mode === 'opfs' &&
      this.opfsWritable &&
      this.opfsFileHandle &&
      this.opfsRoot
    ) {
      // Drain the write queue - do not close until all chunks have landed.
      await this.writeQueue;
      await this.opfsWritable.close();
      this.opfsWritable = null;

      // Read raw PCM bytes back from disk
      const file = await this.opfsFileHandle.getFile();
      const rawBuffer = await file.arrayBuffer();

      // Clean up - delete the temporary session file to free OPFS space
      try {
        await this.opfsRoot.removeEntry(`vektr_rec_${this.sessionId}.pcm`);
      } catch {
        // Non-fatal - OPFS will be cleaned by the browser eventually
      }

      this.opfsFileHandle = null;
      this.opfsRoot = null;
      this.mode = null;

      // Decode the contiguous byte stream back into Float32 samples
      const samples = new Float32Array(rawBuffer);
      return encodeFloat32Wav([samples], LOCKED_SAMPLE_RATE);
    }

    // Memory path - encode directly from accumulated chunks
    const blob = encodeFloat32Wav(this.memChunks, LOCKED_SAMPLE_RATE);
    this.memChunks = [];
    this.mode = null;
    return blob;
  }

  /**
   * Aborts the session without producing a blob.
   * Use when the user discards a recording or an unrecoverable error occurs.
   */
  async abort(): Promise<void> {
    if (this.opfsWritable) {
      try { await this.opfsWritable.abort(); } catch { /* already closed */ }
      this.opfsWritable = null;
    }

    if (this.opfsFileHandle && this.opfsRoot) {
      try {
        await this.opfsRoot.removeEntry(`vektr_rec_${this.sessionId}.pcm`);
      } catch { /* non-fatal */ }
      this.opfsFileHandle = null;
      this.opfsRoot = null;
    }

    this.memChunks = [];
    this.mode = null;
  }

  get activeMode(): ChunkWriterMode | null {
    return this.mode;
  }

  get totalChunksWritten(): number {
    return this.chunkCount;
  }
}

