/**
 * useLiveMonitor - Real-time Audio Monitor Hook
 *
 * Refactored to provide studio-standard amplitude and peak metering.
 *
 * Usage:
 *   const { amplitude, peak } = useLiveMonitor(isActive);
 *   // amplitude: 0..1 average frequency power
 *   // peak: 0..1 highest single bin value
 */
import { useState, useEffect, useRef } from 'react';

export interface MonitorData {
  amplitude: number; // 0..1 normalized average amplitude
  peak: number;      // 0..1 normalized peak bin value
}

const SILENT: MonitorData = { amplitude: 0, peak: 0 };

export function useLiveMonitor(isActive: boolean): MonitorData {
  const [monitor, setMonitor] = useState<MonitorData>(SILENT);

  // Refs - holds AudioContext and rAF id so cleanup is exact
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Deactivate - cancel rAF, close context, reset state
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      setMonitor(SILENT);
      return;
    }

    let cancelled = false;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          // Component unmounted or isActive flipped before mic was granted
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass() as AudioContext;
        const analyser = ctx.createAnalyser();

        // 256 for fast, responsive metering
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8; // Gentle smoothing for visual stability

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        // 60fps analysis loop (requestAnimationFrame - no setInterval drift)
        const loop = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

          // Average amplitude
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const avg = sum / dataArrayRef.current.length;

          // Peak bin
          let peak = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            if (dataArrayRef.current[i] > peak) peak = dataArrayRef.current[i];
          }

          setMonitor({
            amplitude: avg / 255,
            peak: peak / 255,
          });

          rafIdRef.current = requestAnimationFrame(loop);
        };

        loop();
      } catch (err) {
        console.warn('useLiveMonitor: Mic access denied or unavailable.', err);
      }
    };

    initAudio();

    return () => {
      cancelled = true;
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      setMonitor(SILENT);
    };
  }, [isActive]);

  return monitor;
}

