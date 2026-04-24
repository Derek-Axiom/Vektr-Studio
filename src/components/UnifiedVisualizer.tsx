/**
 * React Component: Unified Visualizer
 * 
 * The complete identity-forged visualization system.
 * Combines 3D geometry + kinetic lyrics + particle systems.
 */

import React, { useEffect, useRef, useState } from 'react';
import { UnifiedVisualizer } from '../lib/UnifiedVisualizer';
import type { MediaItem, PublicProfile } from '../types';

interface UnifiedVisualizerProps {
  profile: PublicProfile;
  track: MediaItem;
  currentTime: number;
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    amplitude: number;
    peak: number;
  };
  mode: '3d-only' | 'lyrics-only' | 'unified' | 'metabolic';
  className?: string;
}

export function UnifiedVisualizerComponent({
  profile,
  track,
  currentTime,
  audioData,
  mode,
  className = '',
}: UnifiedVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<UnifiedVisualizer | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Initialize visualizer
  useEffect(() => {
    if (!containerRef.current) return;
    
    const config = {
      userId: profile.ownerId,
      trackId: track.id,
      sessionTimestamp: track.createdAt,
      bpm: track.bpm || 120,
      key: track.key || 'C',
      energy: track.analysisData?.energy || 0.5,
      lyrics: track.transcription,
      segments: track.transcriptionSegments,
      mode,
    };
    
    visualizerRef.current = new UnifiedVisualizer(containerRef.current, config);
    setIsReady(true);
    
    return () => {
      visualizerRef.current?.destroy();
      visualizerRef.current = null;
    };
  }, [track.id, mode]);
  
  // Update audio data (60fps)
  useEffect(() => {
    if (!visualizerRef.current) return;
    
    const update = () => {
      visualizerRef.current?.updateAudio(audioData);
      requestAnimationFrame(update);
    };
    
    const rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [audioData]);
  
  // Update playback time
  useEffect(() => {
    visualizerRef.current?.updateTime(currentTime);
  }, [currentTime]);
  
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black ${className}`}
      style={{ minHeight: '400px' }}
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs font-bold uppercase tracking-widest text-white/60">
              Forging Identity Signature...
            </div>
            <div className="text-[10px] font-mono text-white/30">
              Deterministic PRNG - 10KD Tensor Math - Axiomatic Gravity
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

