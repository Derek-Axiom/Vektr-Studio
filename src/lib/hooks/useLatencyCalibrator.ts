import { useState, useRef, useCallback } from 'react';
import { getGlobalAudioContext } from '../audioContextSingleton';

export interface CalibrationResult {
  latencyMs: number;
  confidence: 'high' | 'medium' | 'low';
  varianceMs: number;
}

export function useLatencyCalibrator() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const calibrate = useCallback(async () => {
    setError(null);
    setIsCalibrating(true);
    setResult(null);
    setStep(0);

    const ctx = getGlobalAudioContext();
    if (!ctx) {
      setError('Audio engine not initialized.');
      setIsCalibrating(false);
      return;
    }

    try {
      if (ctx.state === 'suspended') await ctx.resume();

      // Request microphone unconditionally for calibration
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false }
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.0;
      source.connect(analyser);

      const runPing = async (): Promise<number> => {
        return new Promise((resolve, reject) => {
          // Send a sharp 8kHz ping (easily distinguished from room noise)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = 8000;
          osc.type = 'sine';
          
          osc.connect(gain);
          gain.connect(ctx.destination);

          // Find ambient noise floor
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            sum += Math.abs(data[i] - 128);
          }
          const ambientFloor = sum / data.length;
          const threshold = Math.max(15, ambientFloor * 4); // Adaptive threshold

          let fired = false;
          let startTime = 0;
          let timeoutId: number;

          const check = () => {
            if (!fired) {
              rafRef.current = requestAnimationFrame(check);
              return;
            }

            analyser.getByteTimeDomainData(data);
            let peak = 0;
            for (let i = 0; i < data.length; i++) {
              if (Math.abs(data[i] - 128) > peak) peak = Math.abs(data[i] - 128);
            }

            if (peak > threshold) {
              const latency = performance.now() - startTime;
              clearTimeout(timeoutId);
              cancelAnimationFrame(rafRef.current);
              resolve(latency);
            } else {
              rafRef.current = requestAnimationFrame(check);
            }
          };

          // Timeout if ping is never heard (2 seconds)
          timeoutId = window.setTimeout(() => {
            cancelAnimationFrame(rafRef.current);
            reject(new Error('Ping not detected. Are headphones near the mic?'));
          }, 2000);

          // Start looking
          rafRef.current = requestAnimationFrame(check);

          // Fire!
          setTimeout(() => {
            startTime = performance.now();
            fired = true;
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.005);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.06);
          }, 200); // 200ms grace period to let ambient floor settle
        });
      };

      // 3-pass calibration for variance check
      const measurements: number[] = [];
      for (let i = 0; i < 3; i++) {
        setStep(i + 1);
        const ms = await runPing();
        measurements.push(ms);
        // Wait 300ms between pings to let echoes die down
        await new Promise(r => setTimeout(r, 300));
      }

      // Cleanup
      source.disconnect();
      stream.getTracks().forEach(t => t.stop());

      // Statistics
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const variance = Math.max(...measurements) - Math.min(...measurements);
      
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (variance < 5) confidence = 'high';
      else if (variance < 20) confidence = 'medium';

      setResult({
        latencyMs: Math.round(avg),
        varianceMs: Math.round(variance),
        confidence
      });

    } catch (err: any) {
      setError(err.message || 'Calibration failed.');
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    } finally {
      setIsCalibrating(false);
      setStep(0);
    }
  }, []);

  const resetCalibration = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { calibrate, isCalibrating, result, error, step, resetCalibration };
}
