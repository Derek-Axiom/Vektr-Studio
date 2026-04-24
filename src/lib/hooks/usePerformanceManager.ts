import { useState, useEffect, useRef } from 'react';
import { useProfile } from '../ProfileContext';

export type PerformanceMode = 'optimal' | 'thermal_scaling' | 'emergency_killswitch';

export function usePerformanceManager() {
  const { isRecordingSession } = useProfile();
  const [mode, setMode] = useState<PerformanceMode>('optimal');
  const [fps, setFps] = useState(60);
  
  const rafRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const loop = (time: number) => {
      frameCountRef.current++;
      const delta = time - lastTimeRef.current;
      
      if (delta >= 1000) {
        const currentFps = (frameCountRef.current * 1000) / delta;
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = time;

        // Determine Thermal Priority
        if (currentFps < 15 || (isRecordingSession && currentFps < 30)) {
          setMode('emergency_killswitch');
        } else if (currentFps < 40 || isRecordingSession) {
          setMode('thermal_scaling');
        } else {
          setMode('optimal');
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    
    rafRef.current = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRecordingSession]);

  return { mode, fps };
}
