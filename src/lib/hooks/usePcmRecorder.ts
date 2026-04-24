import { useRef, useState } from 'react';
import { ChunkWriter } from '../ChunkWriter';

// ─── Hook Types ──────────────────────────────────────────────────────────────

export type RecordingMode = 'worklet' | 'fallback' | null;

export interface UsePcmRecorderReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordingMode: RecordingMode;
  clearRecording: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * usePcmRecorder
 *
 * Professional-grade recording hook with two-tier architecture:
 *
 * PRIMARY PATH - AudioWorklet + ChunkWriter (OPFS):
 *   Captures raw 32-bit float PCM off the main thread from the OmniRack
 *   DSP chain output. Each PCM chunk is immediately streamed to disk via
 *   the ChunkWriter (OPFS) rather than accumulated in RAM - preventing
 *   memory exhaustion on long recordings. Produces a lossless IEEE 754
 *   float WAV blob on stop.
 *
 * EMERGENCY FALLBACK - MediaRecorder:
 *   Activates only if the AudioWorklet module fails to load. Records at
 *   320kbps to preserve maximum quality within the codec format.
 *
 * recordingMode tells the UI which path was used, so it can surface a
 * quality indicator if the fallback was triggered.
 */
export function usePcmRecorder(
  ctxRef: React.RefObject<AudioContext | null>,
  recorderTapRef: React.RefObject<GainNode | null>
): UsePcmRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>(null);

  // Worklet path
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const workletLoadedRef = useRef(false);
  const chunkWriterRef = useRef(new ChunkWriter());

  // Fallback path
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fallbackChunksRef = useRef<Blob[]>([]);
  const fallbackDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const fallbackMimeRef = useRef('');

  const ensureWorkletLoaded = async (ctx: AudioContext): Promise<boolean> => {
    if (workletLoadedRef.current) return true;
    try {
      await ctx.audioWorklet.addModule('/worklets/pcm-recorder.js');
      workletLoadedRef.current = true;
      return true;
    } catch (err) {
      console.warn('usePcmRecorder: AudioWorklet unavailable. Activating MediaRecorder fallback.', err);
      return false;
    }
  };

  const startRecording = async (): Promise<void> => {
    const ctx = ctxRef.current;
    const tap = recorderTapRef.current;

    if (!ctx || !tap) {
      console.warn('usePcmRecorder: AudioContext or recorder tap not ready.');
      return;
    }

    if (ctx.state === 'suspended') await ctx.resume();

    fallbackChunksRef.current = [];

    const workletAvailable = await ensureWorkletLoaded(ctx);

    if (workletAvailable) {
      // ── PRIMARY PATH: AudioWorklet + OPFS ChunkWriter ────────────────────
      const sessionId = `${Date.now()}`;
      await chunkWriterRef.current.open(sessionId);

      // numberOfOutputs: 0 - pure sink node, no output routing needed.
      const node = new AudioWorkletNode(ctx, 'pcm-recorder', { numberOfOutputs: 0 });

      node.port.onmessage = (event) => {
        if (event.data.type === 'pcm') {
          // Stream each chunk directly to disk - no RAM accumulation.
          chunkWriterRef.current.write(event.data.chunk);
        }
      };

      tap.connect(node);
      node.port.postMessage({ type: 'start' });
      workletNodeRef.current = node;
      setRecordingMode('worklet');

    } else {
      // ── EMERGENCY FALLBACK: MediaRecorder ────────────────────────────────
      const dest = ctx.createMediaStreamDestination();
      tap.connect(dest);
      fallbackDestRef.current = dest;

      const mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
      fallbackMimeRef.current = mime;

      const mr = new MediaRecorder(dest.stream, {
        mimeType: mime,
        audioBitsPerSecond: 320000,
      });

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) fallbackChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(fallbackChunksRef.current, { type: fallbackMimeRef.current });
        setRecordedBlob(blob);
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setRecordingMode('fallback');
    }

    setIsRecording(true);
  };

  const stopRecording = async (): Promise<void> => {
    const tap = recorderTapRef.current;

    if (workletNodeRef.current) {
      // ── Stop Worklet path ─────────────────────────────────────────────────
      workletNodeRef.current.port.postMessage({ type: 'stop' });

      if (tap) {
        try { tap.disconnect(workletNodeRef.current); } catch { /* already disconnected */ }
      }

      workletNodeRef.current.port.close();
      workletNodeRef.current = null;

      // Await final disk flush and assemble WAV from OPFS (or memory fallback)
      const blob = await chunkWriterRef.current.close();
      setRecordedBlob(blob);

    } else if (mediaRecorderRef.current) {
      // ── Stop Fallback path ────────────────────────────────────────────────
      mediaRecorderRef.current.stop(); // blob set via onstop callback
      mediaRecorderRef.current = null;

      if (tap && fallbackDestRef.current) {
        try { tap.disconnect(fallbackDestRef.current); } catch { /* already disconnected */ }
      }
      fallbackDestRef.current = null;
    }

    setIsRecording(false);
  };

  const clearRecording = (): void => {
    // If recording was abandoned mid-session, abort the ChunkWriter
    // to clean up any OPFS temp file.
    if (chunkWriterRef.current.activeMode !== null) {
      chunkWriterRef.current.abort().catch(() => { /* non-fatal */ });
    }
    setRecordedBlob(null);
    setRecordingMode(null);
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    recordedBlob,
    recordingMode,
    clearRecording,
  };
}

