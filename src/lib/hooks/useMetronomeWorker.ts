import { useRef, useEffect, useCallback } from 'react';
import { getGlobalAudioContext } from '../audioContextSingleton';

// SharedArrayBuffer layout
const SAB_RUNNING = 0;  // 0 = stopped, 1 = running
const SAB_BPM     = 1;  // BPM × 100 (integer)
const SAB_BEAT    = 2;  // monotonic beat counter

const BEATS_PER_MEASURE = 4;
const SHARED_BUFFER_INT32_COUNT = 3;

/**
 * useMetronomeWorker - Off-Thread Precision Metronome
 *
 * Replaces window.setInterval() with a dedicated Worker thread that is:
 * - Immune to main-thread event loop stalls
 * - Not throttled when the tab is backgrounded  
 * - Drift-corrected via nextBeatTime scheduling
 *
 * Beat audio is scheduled via the Web Audio API's sample-accurate scheduler
 * (AudioContext.currentTime), not directly from the Worker. This two-layer
 * architecture separates timing (Worker) from audio scheduling (main thread)
 * for maximum precision.
 *
 * SharedArrayBuffer is used when available (requires cross-origin isolation).
 * BPM changes are written directly to shared memory for zero-latency updates.
 * Falls back to message-based BPM delivery gracefully.
 */
export function useMetronomeWorker(
  bpm: number,
  active: boolean,
  onBeat: (beat: number) => void
): void {
  const workerRef = useRef<Worker | null>(null);
  const sharedBufferRef = useRef<SharedArrayBuffer | null>(null);
  const controlRef = useRef<Int32Array | null>(null);
  const onBeatRef = useRef(onBeat);

  // Keep onBeat stable without needing it as a dependency
  useEffect(() => { onBeatRef.current = onBeat; }, [onBeat]);

  // Update BPM in real-time via SharedArrayBuffer (no message round-trip)
  const updateBpm = useCallback((newBpm: number) => {
    if (controlRef.current) {
      Atomics.store(controlRef.current, SAB_BPM, Math.round(newBpm * 100));
    } else if (workerRef.current) {
      // Fallback for environments without SharedArrayBuffer
      workerRef.current.postMessage({ type: 'bpm', bpm: newBpm });
    }
  }, []);

  // Synchronize BPM changes to the running worker
  useEffect(() => {
    if (active) updateBpm(bpm);
  }, [bpm, active, updateBpm]);

  useEffect(() => {
    if (!active) {
      // Stop: signal the worker and clean up
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'stop',
          sharedBuffer: sharedBufferRef.current ?? undefined,
        });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      sharedBufferRef.current = null;
      controlRef.current = null;
      return;
    }

    // Start: create worker, allocate SharedArrayBuffer, wire beat handler
    const worker = new Worker('/workers/metronome-worker.js');
    workerRef.current = worker;

    // Attempt SharedArrayBuffer allocation (requires COOP/COEP headers)
    let sharedBuffer: SharedArrayBuffer | null = null;
    try {
      sharedBuffer = new SharedArrayBuffer(SHARED_BUFFER_INT32_COUNT * Int32Array.BYTES_PER_ELEMENT);
      sharedBufferRef.current = sharedBuffer;
      controlRef.current = new Int32Array(sharedBuffer);
    } catch {
      // Cross-origin isolation not active (e.g. Android WebView without COOP/COEP)
      // Falls back to message-only BPM updates - timing quality is identical
      console.warn('useMetronomeWorker: SharedArrayBuffer unavailable, using message fallback.');
      sharedBufferRef.current = null;
      controlRef.current = null;
    }

    // Beat handler - runs on main thread when worker sends beat event
    worker.onmessage = (event) => {
      if (event.data.type !== 'beat') return;
      const beat = event.data.beat as number;

      // Invoke caller callback (used for UI beat counter updates)
      onBeatRef.current(beat);

      // Schedule the click sound via Web Audio's sample-accurate scheduler
      // This happens on the main thread but uses ctx.currentTime (not Date.now)
      // so the actual audio event is scheduled to the sample level
      const ctx = getGlobalAudioContext();
      if (!ctx || ctx.state === 'suspended') return;

      const isAccent = beat % BEATS_PER_MEASURE === 1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = isAccent ? 1200 : 880;
      osc.type = 'sine';

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(isAccent ? 0.7 : 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    };

    // Start the worker
    worker.postMessage({
      type: 'start',
      bpm,
      sharedBuffer: sharedBuffer ?? undefined,
    });

    return () => {
      worker.postMessage({
        type: 'stop',
        sharedBuffer: sharedBuffer ?? undefined,
      });
      worker.terminate();
      workerRef.current = null;
      sharedBufferRef.current = null;
      controlRef.current = null;
    };
  }, [active]); // bpm changes handled via updateBpm above - intentionally excluded
}

