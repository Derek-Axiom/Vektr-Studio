/**
 * React wrapper for VEKTR Audio Canvas
 */

import React, { useEffect, useRef } from 'react';
import { VektrAudioCanvas, type AudioReactiveConfig } from '../lib/VektrAudioCanvas';

interface VektrCanvasProps {
  config: AudioReactiveConfig;
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    amplitude: number;
  };
  className?: string;
}

export function VektrCanvas({ config, audioData, className = '' }: VektrCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<VektrAudioCanvas | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    if (!containerRef.current) return;
    
    canvasRef.current = new VektrAudioCanvas(containerRef.current, config);
    
    return () => {
      canvasRef.current?.destroy();
      canvasRef.current = null;
    };
  }, [config.trackId]); // Only recreate if track changes
  
  // Update config
  useEffect(() => {
    canvasRef.current?.updateConfig(config);
  }, [config]);
  
  // Update audio data (60fps)
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const updateAudio = () => {
      canvasRef.current?.updateAudio(audioData);
      requestAnimationFrame(updateAudio);
    };
    
    const rafId = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(rafId);
  }, [audioData]);
  
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
