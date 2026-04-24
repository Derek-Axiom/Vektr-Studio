/**
 * Metabolic Visualizer Component
 * 
 * React wrapper for the Metabolic Visualizer Engine.
 * Handles lifecycle, audio integration, and real-time rendering.
 */

import React, { useEffect, useRef, useState } from 'react';
import { MetabolicRenderer, generateSessionIdentity, deriveMetabolicParams, type SessionIdentity, type MetabolicParams } from '../lib/MetabolicVisualizer';
import type { PublicProfile, MediaItem } from '../types';
import type { OmniRackParams } from '../lib/useOmniRack';

interface MetabolicVisualizerProps {
  profile: PublicProfile;
  track: MediaItem;
  rackParams: OmniRackParams;
  audioData: {
    amplitude: number;
    bass: number;
    mid: number;
    treble: number;
    peak: number;
  };
  className?: string;
  showSignature?: boolean; // Show the identity watermark
}

export function MetabolicVisualizer({
  profile,
  track,
  rackParams,
  audioData,
  className = '',
  showSignature = true,
}: MetabolicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MetabolicRenderer | null>(null);
  const rafRef = useRef<number>(0);
  
  const [identity, setIdentity] = useState<SessionIdentity | null>(null);
  const [params, setParams] = useState<MetabolicParams | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize session identity (once per track/session)
  useEffect(() => {
    const init = async () => {
      const sessionStart = Date.now();
      const sessionIdentity = await generateSessionIdentity(
        profile,
        track,
        rackParams,
        sessionStart
      );
      
      const metabolicParams = deriveMetabolicParams(sessionIdentity);
      
      setIdentity(sessionIdentity);
      setParams(metabolicParams);
      setIsReady(true);
    };
    
    init();
  }, [track.id, profile.ownerId]); // Only regenerate if track or user changes

  // Update params when DSP settings change (live)
  useEffect(() => {
    if (!identity || !params) return;
    
    // Regenerate params with new DSP fingerprint
    const updateParams = async () => {
      const sessionIdentity = await generateSessionIdentity(
        profile,
        track,
        rackParams,
        identity.sessionTimestamp // Keep original timestamp
      );
      
      const metabolicParams = deriveMetabolicParams(sessionIdentity);
      setParams(metabolicParams);
      
      // Update renderer if it exists
      if (rendererRef.current) {
        rendererRef.current.updateParams(metabolicParams);
      }
    };
    
    updateParams();
  }, [rackParams]);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current || !params || !identity || !isReady) return;

    const canvas = canvasRef.current;
    const renderer = new MetabolicRenderer(canvas, params, identity);
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      renderer.render(audioData);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      rendererRef.current = null;
    };
  }, [isReady, params, identity]);

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return;

    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      {/* Identity Signature Overlay */}
      {showSignature && identity && (
        <div className="absolute bottom-4 left-4 text-[8px] font-mono text-white/30 select-none pointer-events-none">
          <div>VEKTR METABOLIC ENGINE</div>
          <div className="mt-1">ID: {identity.sovereignProof.slice(0, 16)}...</div>
        </div>
      )}
      
      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs font-bold uppercase tracking-widest text-white/60">
              Generating Identity Signature...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
