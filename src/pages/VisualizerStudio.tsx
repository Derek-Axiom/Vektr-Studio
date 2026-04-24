import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Video, CheckCircle2, Maximize, Smartphone, Square, Monitor, Download, Play, Palette, Activity, Zap, Waves, Settings, Music, Share2, Plus, Terminal, Sparkles as SparklesIcon, ZapOff, Image as ImageIcon, Link2 } from '../lib/icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';
import { useNavigate } from '../lib/router';
import { useART_HardwareFFT as useAudioAnalyzer } from '../components/Modules/modules/audio/ART_HardwareFFT';
import { UnifiedVisualizerComponent } from '../components/UnifiedVisualizer';
import { generateEnhancedProof } from '../lib/EnhancedProofSystem';
import type { SessionContext } from '../lib/VisualizerCanvas';
import { generateCoverUrl } from '../lib/generateCover';
import { buildSovereignContext, computeCreationProof } from '../lib/ART_CanvasHasher';

export default function VisualizerStudio() {
  useSEO('4K Music Video Visualizer', 'Professional music video generator with 6 reactive modes and high-fidelity VP9 export.');
  const { activeTrackId, setActiveTrackId, tracks, lyricBooks, addShareableItem, profile, globalAudioRef, globalAnalyserRef, isPlaying, togglePlay, rackParams } = useProfile();

  const navigate = useNavigate();
  const activeTrack = tracks.find(t => t.id === activeTrackId);
  const activeLyrics = lyricBooks.find(b => b.trackId === activeTrackId);

  const { active: isAudioActive, data: audioData, activateGlobal, deactivate, audioStream } = useAudioAnalyzer();
  const { globalCtxRef } = useProfile();

  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [visualizerType, setVisualizerType] = useState<'Metabolic' | 'Matrix' | 'Cosmic' | 'Glitch' | 'Quantum'>('Metabolic');
  const [activeStyle, setActiveStyle] = useState<'Glow' | 'VHS' | 'Retro' | 'Modern' | 'Abstract' | 'Minimal'>('Glow');
  const [showIntegrityGhost, setShowIntegrityGhost] = useState(false);
  const [sovereignHash, setSovereignHash] = useState<string | null>(null);
  const [currentProof, setCurrentProof] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Generate enhanced proof when track changes
  useEffect(() => {
    if (!activeTrack) return;

    generateEnhancedProof(
      profile,
      activeTrack,
      rackParams,
      activeLyrics?.content,
      activeLyrics?.syncLines
    ).then(proof => {
      setCurrentProof(proof);
      console.log('[VEKTR] Enhanced proof generated:', proof);
    }).catch(err => {
      console.error('[VEKTR] Proof generation failed:', err);
    });
  }, [activeTrack?.id, profile, activeLyrics, rackParams]);

  const handleExport = () => {
    if (!canvasRef.current || !globalAudioRef.current) return;

    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Create a real audio destination from the global AudioContext
    const ctx = globalCtxRef?.current;
    if (!ctx) return;
    const dest = ctx.createMediaStreamDestination();
    // Connect the global audio source (already routed through analyser) to the recording destination
    if (globalAnalyserRef?.current) {
      globalAnalyserRef.current.connect(dest);
    }

    const canvasStream = canvasRef.current.captureStream(60);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 12000000
    });

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      // Include proof hash in filename
      const proofSuffix = currentProof ? `_${currentProof.nfodHash.slice(0, 8)}` : '';
      a.href = url;
      a.download = `VEKTR_${activeTrack?.title || 'Visual'}${proofSuffix}.webm`;
      a.click();
      URL.revokeObjectURL(url);

      // Log proof for verification
      if (currentProof) {
        console.log('[VEKTR] Exported with proof:', currentProof);
      }
    };

    globalAudioRef.current.currentTime = 0;
    recorder.start();
    if (!isPlaying) togglePlay();
    setIsRecording(true);
    recorderRef.current = recorder;
  };

  const sessionContext = useMemo((): SessionContext | undefined => {
    if (!activeTrack) return undefined;
    const flatLyrics = activeLyrics?.content || '';
    return {
      profileId: profile.ownerId,
      username: profile.displayName,
      trackTitle: activeTrack.title,
      lyrics: flatLyrics,
      mastering: {
        saturation: rackParams.saturation,
        clarity: Math.max(0, 100 - rackParams.compression),
      },
      logoUrl: logoUrl,
      syncLines: activeLyrics?.syncLines
    };
  }, [activeTrack, activeLyrics, profile, logoUrl, rackParams]);

  // Compute the Sovereign NFOD Root Hash for the watermark
  useEffect(() => {
    if (!activeTrack) { setSovereignHash(null); return; }
    const waitBuild = async () => {
       const ctx = buildSovereignContext(
         profile,
         activeTrack as any,
         rackParams,
         activeLyrics?.content || '',
         activeLyrics?.syncLines,
         undefined,
         logoUrl
       );
       const hash = await computeCreationProof(ctx);
       setSovereignHash(hash);
    };
    waitBuild();
  }, [activeTrack, profile, rackParams, activeLyrics, logoUrl]);

  const ratios = [
    { id: '9:16', label: 'Vertical', icon: Smartphone },
    { id: '1:1', label: 'Square', icon: Square },
    { id: '16:9', label: 'Landscape', icon: Monitor },
  ];

  const visualizers = [
    { id: 'Metabolic', icon: Zap, label: 'Metabolic (Identity-Forged)' },
    { id: 'Matrix', icon: Terminal, label: 'Matrix' },
    { id: 'Cosmic', icon: SparklesIcon, label: 'Cosmic Horizon' },
    { id: 'Glitch', icon: ZapOff, label: 'Cyber Glitch' },
    { id: 'Quantum', icon: Activity, label: 'Quantum (Lyrics)' },
  ];

  const styles: Array<'Minimal' | 'Glow' | 'VHS' | 'Retro' | 'Modern' | 'Abstract'> = ['Minimal', 'Glow', 'VHS', 'Retro', 'Modern', 'Abstract'];

  useEffect(() => {
    if (activeTrack?.fileUrl && globalAnalyserRef.current) {
      activateGlobal(globalAnalyserRef.current);
    } else if (activeTrackId) {
      setActiveTrackId(null);
    }
    return () => deactivate();
  }, [activeTrackId, activeTrack, globalAnalyserRef, activateGlobal, deactivate, navigate]);

  useEffect(() => {
    if (!globalAudioRef.current || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(globalAudioRef.current?.currentTime || 0);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, globalAudioRef]);

  const handleAddToBio = () => {
    addShareableItem({
      type: 'visual',
      title: `${activeTrack?.title || 'Visual'} (${visualizerType})`,
      subtitle: `Visualizer - ${activeStyle} Style`,
      thumbnail: generateCoverUrl(visualizerType),
      sourceId: activeTrackId || `visual-${Date.now()}`,
      isVisible: true,
      sortOrder: 0
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-[24px] w-full min-h-[800px]">

      {/* 8. HEADER SYSTEM */}
      <div className="page-header">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-[24px]">
          <div className="flex flex-col">
            <span className="text-app-label">ENGINE LAB</span>
            <h1 className="text-page-title mb-[8px]">Visualizer Studio</h1>
            <p className="text-body max-w-lg">
              {activeTrack?.title ? `Mastering: ${activeTrack.title} - Word-Storm Engine 4.0` : 'No Source Loaded'}
            </p>
          </div>

          <div className="flex items-center gap-[12px]">
            <button onClick={handleAddToBio} disabled={!activeTrackId} className="ui-button-secondary disabled:opacity-50">
               <Plus className="w-4 h-4" /> Inject to Bio
            </button>
            <button disabled={!activeTrackId} onClick={handleExport} className={cn("ui-button disabled:opacity-50", isRecording ? "bg-red-500 border-red-400 text-[var(--color-text)] shadow-lg animate-pulse" : "")}>
               {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Download className="w-4 h-4" />}
               {isRecording ? 'Terminate' : 'Export Sequence'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. PANEL SYSTEM */}
      <div className="ui-panel p-0 flex flex-col lg:flex-row h-[700px] overflow-hidden">

        {/* 11. CANVAS / WORK AREA */}
        <div className="flex-1 p-[24px] relative bg-[var(--color-bg)] border-r border-white/[0.06] flex items-center justify-center">

          <div className="absolute top-[24px] left-[24px] flex gap-[4px] bg-[var(--color-bg-panel)] p-1 rounded-[10px] border border-white/[0.06] z-20 shadow-lg">
            {ratios.map(r => (
              <button key={r.id} onClick={() => setAspectRatio(r.id as any)}
                className={cn('flex items-center gap-[6px] px-[12px] py-[8px] rounded-[6px] text-micro tracking-widest transition-all',
                  aspectRatio === r.id ? 'bg-white/[0.1] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text)] hover:text-[var(--color-text)]')}>
                <r.icon className="w-3.5 h-3.5" />{r.label}
              </button>
            ))}
          </div>

          <motion.div layout transition={{ duration: 0.4 }}
            className={cn('bg-[var(--color-bg-panel)] relative overflow-hidden border border-white/[0.1] rounded-[12px] shadow-2xl',
              aspectRatio === '9:16' ? 'aspect-[9/16] h-full max-h-[600px]' :
              aspectRatio === '1:1' ? 'aspect-square h-full max-h-[500px]' :
              'aspect-video w-full')}>

            {activeTrack ? (
              <UnifiedVisualizerComponent
                profile={profile}
                track={activeTrack}
                currentTime={currentTime}
                audioData={{
                  bass: audioData.bass,
                  mid: audioData.mid,
                  treble: audioData.treble,
                  amplitude: audioData.amplitude,
                  peak: audioData.peak,
                }}
                mode={
                  visualizerType === 'Metabolic' ? 'metabolic' :
                  visualizerType === 'Quantum' && activeLyrics ? 'unified' :
                  activeLyrics ? 'unified' : '3d-only'
                }
                className="absolute inset-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">No Track Selected</div>
                </div>
              </div>
            )}

            {/* Copyright Proof Display */}
            {currentProof && activeTrack && (
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 max-w-xs pointer-events-none z-30">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">
                  Copyright Proof
                </div>
                <div className="text-[9px] font-mono text-white/60 break-all">
                  {currentProof.nfodHash.slice(0, 32)}...
                </div>
                <div className="text-[8px] text-white/40 mt-1">
                  Deterministically generated - Mathematically unique
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-[24px] pointer-events-none text-center">
              <AnimatePresence>
                {!activeTrack && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="bg-[var(--color-bg-panel)]/90 backdrop-blur-md px-[24px] py-[16px] rounded-[12px] border border-white/[0.06] inline-block shadow-lg">
                    <p className="text-micro text-[var(--color-text)]">Source Input Missing</p>
                    <p className="text-[10px] font-bold text-[var(--color-text)] tracking-widest mt-1 uppercase">Select vault asset to begin telemetry</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTrack && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-[8px]">
                  <h2 className="text-[var(--color-text)] text-3xl font-bold tracking-tight uppercase drop-shadow-md">{activeTrack.title}</h2>
                  <p className="text-[var(--color-text)] text-micro">{activeTrack.artist}</p>
                </motion.div>
              )}
            </div>

            {activeTrack && (
              <div className="absolute top-[24px] right-[24px] pointer-events-auto">
                <button onClick={togglePlay} className="w-[48px] h-[48px] rounded-[12px] bg-white/[0.05] backdrop-blur-md border border-white/[0.1] flex items-center justify-center text-[var(--color-text)] hover:bg-white/[0.1] transition-all shadow-lg group">
                  {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-5 h-5 ml-1 fill-white" />}
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* 10. RIGHT PANEL / CONTROL COLUMN */}
        <aside className="w-[340px] shrink-0 bg-[var(--color-bg-panel)] flex flex-col overflow-y-auto">

          <div className="p-[24px] border-b border-white/[0.06]">
            <h3 className="text-app-label mb-[16px] flex items-center gap-2">
              <Music className="w-4 h-4 text-[var(--color-text)]" /> Source Selection
            </h3>
            {tracks.length === 0 ? (
               <button onClick={() => navigate('/library')} className="w-full h-[64px] border border-dashed border-white/[0.1] rounded-[12px] flex items-center justify-center gap-[12px] hover:bg-white/[0.02] transition-colors group">
                  <Link2 className="w-4 h-4 text-[var(--color-text)] group-hover:text-[var(--color-text)] transition-colors" />
                  <span className="text-micro group-hover:text-[var(--color-text)] transition-colors">Open Media Vault</span>
               </button>
            ) : (
              <select value={activeTrackId || ''} onChange={(e) => setActiveTrackId(e.target.value)}
                className="ui-input cursor-pointer appearance-none bg-white/[0.02]">
                <option value="" disabled>Select Audio Source</option>
                {tracks.map(t => (
                  <option key={t.id} value={t.id} className="bg-[var(--color-bg-panel)]">{t.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex-1 p-[24px] space-y-[32px]">

            <section className="space-y-[16px]">
              <h3 className="text-app-label flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--color-text)]" /> Simulation Mode
              </h3>
              <div className="grid grid-cols-2 gap-[8px]">
                {visualizers.map(v => (
                  <button key={v.id} onClick={() => setVisualizerType(v.id as any)}
                    className={cn('p-[12px] rounded-[12px] border flex flex-col gap-[12px] transition-all text-left group',
                      visualizerType === v.id ? 'border-white/[0.2] bg-white/[0.08] text-[var(--color-text)] shadow-md' : 'border-white/[0.04] bg-white/[0.02] text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-white/[0.04]')}>
                    <v.icon className={cn("w-4 h-4", visualizerType === v.id ? "text-[var(--color-text)]" : "text-[var(--color-text)] group-hover:text-[var(--color-text)]")} />
                    <span className="text-micro">{v.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-[16px]">
              <h3 className="text-app-label flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--color-text)]" /> Aesthetic Filter
              </h3>
              <div className="grid grid-cols-2 gap-[8px]">
                {styles.map(style => (
                  <button key={style} onClick={() => setActiveStyle(style as any)}
                    className={cn('py-[12px] rounded-[10px] border text-micro transition-all',
                      activeStyle === style
                        ? 'bg-white/[0.1] text-[var(--color-text)] border-white/[0.1] shadow-sm'
                        : 'border-white/[0.04] text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-white/[0.04]')}>
                    {style}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-[16px]">
              <h3 className="text-app-label flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-[var(--color-text)]" /> Sovereign Protocol
              </h3>
              <div className="flex flex-col gap-[8px]">
                <button onClick={() => setShowIntegrityGhost(p => !p)}
                   className={cn("w-full h-[48px] border rounded-[12px] flex items-center justify-center gap-[12px] transition-all",
                     showIntegrityGhost ? "border-[#ff0055] bg-[#ff0055]/10 text-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.2)]" : "border-white/[0.06] bg-white/[0.02] text-[var(--color-text)] hover:bg-white/[0.04]")}>
                   <Activity className="w-4 h-4" />
                   <span className="text-micro font-bold tracking-widest uppercase">
                     {showIntegrityGhost ? 'Integrity Matrix Active' : 'Pre-Validation Check'}
                   </span>
                </button>
              </div>
            </section>

            <section className="space-y-[16px]">
              <h3 className="text-app-label flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--color-text)]" /> Dynamic Watermark
              </h3>
              <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <button onClick={() => logoInputRef.current?.click()}
                 className="w-full h-[80px] border border-white/[0.06] rounded-[12px] bg-white/[0.02] flex items-center justify-center gap-[12px] transition-colors hover:bg-white/[0.04] group">
                 {logoUrl ? (
                    <img src={logoUrl} className="h-[40px] max-w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform" />
                 ) : (
                    <>
                      <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
                        <Plus className="w-4 h-4 text-[var(--color-text)]" />
                      </div>
                      <span className="text-micro text-[var(--color-text)] group-hover:text-[var(--color-text)] transition-colors">Inject Overlay</span>
                    </>
                 )}
              </button>
            </section>

          </div>
        </aside>

      </div>
    </div>
  );
}
