/**
 * DEPLOYMENT: Autonomous UI Engine / Axiogenesis Ecosystem
 * MODULE: ART_HardwareFFT (v2 - Extended)
 *
 * DESCRIPTION:
 * A pure Web Audio API custom React hook that extracts audio frequency data
 * natively without standard libraries like Howler.js or Tone.js. It executes 
 * a Fast Fourier Transform (FFT) array extraction at 60fps to isolate amplitude, 
 * bass, mid, and treble data directly from the device's physical audio hardware.
 * 
 * Extended with activateGlobal() to tap an existing shared AnalyserNode without
 * creating a new AudioContext (used by the global playback pipeline).
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioAnalyzerData {
  amplitude: number;
  peak: number;
  frequencies: number[];
  waveform: number[];
  bass: number;
  mid: number;
  treble: number;
  snr: number;
  confidence: 'high' | 'low';
}

const EMPTY: AudioAnalyzerData = {
  amplitude: 0, peak: 0, frequencies: [], waveform: [], bass: 0, mid: 0, treble: 0, snr: 0, confidence: 'high'
};

export function useART_HardwareFFT() {
  const [active, setActive] = useState(false);
  const [data, setData] = useState<AudioAnalyzerData>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const rafRef = useRef<number>(0);
  const freqArrayRef = useRef<Uint8Array | null>(null);
  const waveArrayRef = useRef<Uint8Array | null>(null);

  const loop = useCallback(() => {
    if (!analyserRef.current || !freqArrayRef.current || !waveArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(freqArrayRef.current as any);
    analyserRef.current.getByteTimeDomainData(waveArrayRef.current as any);

    const freq = Array.from(freqArrayRef.current as unknown as Iterable<number>);
    const wave = Array.from(waveArrayRef.current as unknown as Iterable<number>);

    const amplitude = freq.reduce((s, v) => s + v, 0) / (freq.length || 1) / 255;
    const peak = Math.max(...freq) / 255;

    const bass = freq.slice(0, 10).reduce((s, v) => s + v, 0) / 10 / 255;
    const mid = freq.slice(10, 50).reduce((s, v) => s + v, 0) / 40 / 255;
    const treble = freq.slice(50).reduce((s, v) => s + v, 0) / (freq.length - 50 || 1) / 255;

    // FFT Confidence Scoring (Signal-to-Noise Proxy using Crest Factor)
    // White noise crest factor is ~1.5. Clean vocals/instruments are usually > 3.0.
    const snr = amplitude > 0.005 ? peak / amplitude : 0;
    // Silence is 'high' confidence (we confidently detect silence).
    // If it's loud but flat (snr < 2.2), it might be wind noise, interference, or AC hum.
    const confidence = (amplitude < 0.01 || snr > 2.2) ? 'high' : 'low';

    setData({ amplitude, peak, frequencies: freq, waveform: wave, bass, mid, treble, snr, confidence });

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const deactivate = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    destinationRef.current = null;
    setActive(false);
    setData(EMPTY);
  }, []);

  const activateMic = useCallback(async () => {
    try {
      deactivate();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new window.AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      freqArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      waveArrayRef.current = new Uint8Array(analyser.fftSize);

      setActive(true);
      setError(null);
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setError('Microphone access denied.');
    }
  }, [loop, deactivate]);

  const activateFile = useCallback((audioElement: HTMLAudioElement) => {
    try {
      if (audioCtxRef.current && sourceRef.current instanceof MediaElementAudioSourceNode && sourceRef.current.mediaElement === audioElement) {
        setActive(true);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      
      deactivate();
      const ctx = new window.AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const source = ctx.createMediaElementSource(audioElement);
      const destination = ctx.createMediaStreamDestination();
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyser.connect(destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      destinationRef.current = destination;
      
      freqArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      waveArrayRef.current = new Uint8Array(analyser.fftSize);

      setActive(true);
      setError(null);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setError(`Audio context error: ${e.message}`);
    }
  }, [loop, deactivate]);

  /** 
   * Tap an existing shared AnalyserNode (e.g. from the global playback pipeline)
   * without creating a new AudioContext. Zero-copy, zero-overhead.
   */
  const activateGlobal = useCallback((globalAnalyser: AnalyserNode) => {
    try {
      cancelAnimationFrame(rafRef.current);
      analyserRef.current = globalAnalyser;
      freqArrayRef.current = new Uint8Array(globalAnalyser.frequencyBinCount);
      waveArrayRef.current = new Uint8Array(globalAnalyser.fftSize);
      
      setActive(true);
      setError(null);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setError(`Global analyser error: ${e.message}`);
    }
  }, [loop]);

  useEffect(() => () => deactivate(), [deactivate]);

  return { 
    active, data, error, activateMic, activateFile, activateGlobal, deactivate,
    audioStream: destinationRef.current?.stream || null
  };
}

