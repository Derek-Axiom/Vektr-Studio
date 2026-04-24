import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProfile } from '../lib/ProfileContext';
import { getOrCreateGlobalAudioContext } from '../lib/audioContextSingleton';
import { motion, AnimatePresence } from 'motion/react';
import { useSEO } from '../lib/useSEO';
import { Disc3, Play, Square, Upload, Circle, Settings2, Trash2, Layers, Download, Plus, Zap, Music2 } from '../lib/icons';
import { cn } from '../lib/utils';
import { useNavigate } from '../lib/router';
import { usePcmRecorder } from '../lib/hooks/usePcmRecorder';
import { injectWavMetadata } from '../lib/wavMetadata';

const KEY_MAP = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

const padColors = {
  idle: 'bg-white/[0.02] border-white/[0.06]',
  active: 'bg-white/[0.08] border-white/[0.2]',
  triggered: 'bg-white text-black shadow-lg',
  selected: 'border-[#7ca2ff] ring-1 ring-[#7ca2ff] bg-[#7ca2ff]/10'
};

interface PadState {
  id: number;
  buffer: AudioBuffer | null;
  name: string;
  isTriggered: boolean;
  volume: number;
}

export default function SamplerStudio() {
  useSEO('4x4 MPC Sampler', 'Zero-latency WebAudio beat pad with 16-pad MPC grid and loop recording.');
  const { profile, tracks, uploadTrack, globalCtxRef } = useProfile();
  const navigate = useNavigate();

  const [pads, setPads] = useState<PadState[]>(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      buffer: null,
      name: 'Empty',
      isTriggered: false,
      volume: 1,
    }))
  );

  const [activePadId, setActivePadId] = useState<number | null>(null);
  const [lastTriggered, setLastTriggered] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tapRef = useRef<GainNode | null>(null);

  const { startRecording, stopRecording, isRecording, recordedBlob, recordingMode, clearRecording } = usePcmRecorder(audioCtxRef, tapRef);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = globalCtxRef?.current ?? getOrCreateGlobalAudioContext();
      audioCtxRef.current = ctx;
      
      const tap = ctx.createGain();
      tap.connect(ctx.destination);
      tapRef.current = tap;
    }
  };

  const triggerPad = useCallback((padId: number) => {
    initAudio();
    const pad = pads[padId];
    if (!pad || !pad.buffer || !audioCtxRef.current || !tapRef.current) {
      setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: true } : p));
      setTimeout(() => setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: false } : p)), 80);
      return;
    }

    setLastTriggered(padId);
    setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: true } : p));
    setTimeout(() => setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: false } : p)), 120);

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = pad.buffer;
    const gain = audioCtxRef.current.createGain();
    gain.gain.value = pad.volume;
    source.connect(gain);
    gain.connect(tapRef.current); // Routes to global output and usePcmRecorder
    source.start(0);
  }, [pads]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      const padIndex = KEY_MAP.indexOf(key);
      if (padIndex !== -1 && !e.repeat) triggerPad(padIndex);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerPad]);

  const loadTrackToPad = async (track: typeof tracks[0]) => {
    if (activePadId === null) return;
    initAudio();
    if (!audioCtxRef.current || !track.fileUrl) return;
    try {
      const res = await fetch(track.fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
      setPads(prev => prev.map(p => p.id === activePadId ? {
        ...p, buffer: audioBuffer, name: track.title,
      } : p));
      setActivePadId(null);
    } catch(e) { console.error("Could not load pad audio:", e); }
  };

  const clearPad = (padId: number) => {
    setPads(prev => prev.map(p => p.id === padId ? { ...p, buffer: null, name: 'Empty' } : p));
  };

  const toggleRecording = async () => {
    initAudio();
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const saveToVault = async () => {
    if (!recordedBlob) return;
    try {
      const title = `Beat Loop ${new Date().toLocaleTimeString()}`;
      let finalBlob = recordedBlob;

      // Inject BWF and RIFF INFO double-buffer metadata if it's a WAV
      if (recordingMode === 'worklet') {
        const enhancedBlob = await injectWavMetadata(recordedBlob, {
          title,
          artist: profile.displayName || 'Vektr Studio User',
          software: 'VEKTR Studio - Sampler'
        });
        finalBlob = enhancedBlob;
      }

      const ext = recordingMode === 'worklet' ? 'wav' : 'webm';
      const file = new File([finalBlob], `${title}.${ext}`, { type: finalBlob.type });
      await uploadTrack(file);
      navigate('/library');
    } catch(e) { console.error("Export metadata failed:", e); }
  };

  const loadedCount = pads.filter(p => p.buffer).length;

  return (
    <div className="flex flex-col gap-[24px] w-full min-h-[800px]">
      
      {/* HEADER SYSTEM */}
      <div className="page-header relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-[24px]">
          <div className="flex flex-col">
             <span className="text-app-label">Hardware Emulation</span>
             <h1 className="text-page-title mb-[8px]">Sampler Studio</h1>
             <p className="text-body max-w-lg">
                Zero-latency MPC beat pad with robust loop recording and track mapping.
             </p>
          </div>
          
          <div className="flex items-center gap-[16px]">
            <div className="flex items-center gap-[8px] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text)]">
              <Settings2 className="w-4 h-4 text-[var(--color-text)]" /> 
              {isRecording ? <span className="text-red-500 animate-pulse">RECORDING</span> : <span className="text-[var(--color-text)]">IDLE</span>}
            </div>
            <div className="w-[1px] h-[16px] bg-white/[0.1]"></div>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Buffer Safe
            </div>
          </div>
        </div>
      </div>

      <div className="ui-panel p-0 flex flex-col lg:flex-row h-[750px] overflow-hidden">
        
        {/* LEFT RAIL: MACHINE STATUS */}
        <aside className="w-[320px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-panel)] flex flex-col h-full overflow-y-auto">
          <header className="p-[24px] border-b border-[var(--color-border)]">
            <div className="text-app-label mb-[8px]">Machine Module</div>
            <h2 className="text-section-title">Sampler</h2>
          </header>

          <div className="p-[24px] space-y-[40px] flex-1">
             <div className="space-y-[16px]">
                <h4 className="text-app-label">Engine Status</h4>
                <div className="p-[24px] rounded-[16px] bg-white/[0.02] border border-white/[0.06] space-y-[24px] shadow-sm">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--color-text)]">
                      <span>Active Banks</span>
                      <span className="text-[var(--color-text)]">{loadedCount}/16</span>
                   </div>
                   <div className="h-[4px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(loadedCount/16)*100}%` }} />
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--color-text)]">
                      <span>Latency Limit</span>
                      <span className="text-emerald-500">{audioCtxRef.current ? `${(((audioCtxRef.current.baseLatency || 0) + (audioCtxRef.current.outputLatency || 0)) * 1000).toFixed(1)}ms` : '--'}</span>
                   </div>
                </div>
             </div>

             <div className="space-y-[16px]">
                <h4 className="text-app-label">Master Transport</h4>
                <button onClick={toggleRecording} className={cn("ui-button w-full h-[56px] text-micro tracking-[0.2em] transition-all",
                  isRecording ? "bg-red-500 text-[var(--color-text)] shadow-xl animate-pulse" : "")}>
                  {isRecording ? <><Square className="w-4 h-4 fill-current" /> Stop Loop</> : <><Circle className="w-4 h-4 text-red-500" /> Record Session</>}
                </button>
             </div>

             <div className="space-y-[16px] pt-[24px] border-t border-white/[0.06]">
                <h4 className="text-app-label">Trigger Map</h4>
                <div className="grid grid-cols-4 gap-[8px]">
                  {KEY_MAP.map(k => (
                    <div key={k} className="aspect-square rounded-[8px] bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-micro text-[var(--color-text)] uppercase">
                      {k}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </aside>

        {/* MAIN PANEL: PAD MATRIX */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg relative">
          
          <div className="flex-1 flex flex-col items-center justify-center p-[48px] relative z-10">
            <div className="grid grid-cols-4 gap-[16px] w-full max-w-[600px] aspect-square">
              {pads.map((pad, i) => (
                <motion.div key={pad.id} className="relative group w-full h-full" whileTap={{ scale: 0.96 }}>
                  <button
                    onMouseDown={() => triggerPad(pad.id)}
                    onClick={() => { if (!pad.buffer) setActivePadId(pad.id); }}
                    className={cn(
                      "w-full h-full relative rounded-[16px] transition-all duration-75 overflow-hidden flex flex-col items-center justify-center border select-none group focus:outline-none",
                      pad.isTriggered ? padColors.triggered : (pad.buffer ? (activePadId === i ? padColors.selected : padColors.active) : padColors.idle)
                    )}
                  >
                    <div className="absolute top-[16px] left-[16px] flex items-center gap-[8px]">
                       <div className={cn("w-[6px] h-[6px] rounded-full transition-colors hidden sm:block", pad.buffer ? (pad.isTriggered ? "bg-black" : "bg-emerald-500") : "bg-white/[0.1]")} />
                       <span className={cn("text-micro", pad.isTriggered ? "text-black" : "text-[var(--color-text)]")}>{KEY_MAP[i]}</span>
                    </div>

                    {pad.buffer ? (
                      <div className="space-y-[16px] px-[16px] w-full text-center">
                        <div className={cn("text-card-title truncate", pad.isTriggered ? "text-black" : "text-[var(--color-text)]")}>
                          {pad.name}
                        </div>
                        <div className={cn("h-[4px] w-full rounded-full overflow-hidden", pad.isTriggered ? "bg-black/20" : "bg-white/[0.1]")}>
                          <motion.div animate={{ x: pad.isTriggered ? ['0%', '100%'] : '0%' }} className={cn("h-full w-1/2", pad.isTriggered ? "bg-black" : "bg-[#7ca2ff]")} />
                        </div>
                      </div>
                    ) : (
                      <Plus className="w-8 h-8 opacity-20 group-hover:opacity-60 transition-opacity" />
                    )}

                    {pad.buffer && (
                      <div onClick={(e) => { e.stopPropagation(); clearPad(pad.id); }} 
                        className="absolute bottom-[8px] right-[8px] opacity-0 group-hover:opacity-100 transition-opacity p-2 cursor-pointer z-10 w-8 h-8 flex items-center justify-center bg-black/20 rounded-full">
                        <Trash2 className="w-4 h-4 text-[var(--color-text)]" />
                      </div>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {recordedBlob && !isRecording && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-[40px] left-1/2 -translate-x-1/2 w-full max-w-[500px] p-[32px] bg-[var(--color-bg-panel)] border border-white/[0.1] shadow-2xl rounded-[16px] z-50">
                <div className="flex justify-between items-start mb-[32px]">
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[48px] h-[48px] rounded-[12px] bg-white flex items-center justify-center shadow-md">
                       <Zap className="w-5 h-5 text-black" />
                    </div>
                    <div>
                       <h3 className="text-section-title italic">Active Loop Capture</h3>
                       <p className="text-micro mt-1 text-[var(--color-text)]">{(recordedBlob.size / 1024 / 1024).toFixed(2)} MB - COMMIT READY</p>
                    </div>
                  </div>
                  <button onClick={clearRecording} className="w-8 h-8 rounded-[8px] bg-white/[0.05] hover:bg-red-500/20 text-[var(--color-text)] hover:text-red-500 flex items-center justify-center transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="bg-white/[0.02] rounded-[12px] p-4 mb-[24px] border border-white/[0.06]">
                   <audio src={URL.createObjectURL(recordedBlob)} controls className="w-full h-[40px] opacity-80 mix-blend-screen" />
                </div>
                
                <button onClick={saveToVault} className="ui-button w-full h-[56px] bg-white text-black hover:bg-white/90">
                   Commit to Vault <Download className="w-4 h-4 ml-2" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RIGHT RAIL: ASSET INJECTOR */}
        <aside className="w-[340px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-bg-panel)] flex flex-col h-full overflow-y-auto">
          <header className="p-[24px] border-b border-[var(--color-border)]">
            <div className="text-app-label mb-[8px]">Asset Injector</div>
            <h2 className="text-section-title">
              {activePadId !== null ? `Mapping Pad ${KEY_MAP[activePadId].toUpperCase()}` : 'Bank Monitor'}
            </h2>
          </header>

          <div className="p-[24px] flex-1 overflow-y-auto">
            {activePadId !== null ? (
              <div className="space-y-[12px]">
                {tracks.map((t: any) => (
                  <button key={t.id} onClick={() => loadTrackToPad(t)}
                    className="ui-card flex items-center gap-[16px] w-full group hover:border-white/[0.2] transition-colors p-[12px]">
                    <div className="w-[48px] h-[48px] rounded-[8px] bg-white/[0.05] overflow-hidden shrink-0 flex items-center justify-center relative">
                       {t.thumbnailUrl ? <img src={t.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /> : <Disc3 className="w-6 h-6 text-[var(--color-text)]" />}
                       <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="w-4 h-4 text-[var(--color-text)]" />
                       </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-card-title truncate">{t.title}</p>
                      <p className="text-micro mt-1 text-[var(--color-text)]">{t.category || 'SIGNAL'}</p>
                    </div>
                  </button>
                ))}
                <div className="pt-4 border-t border-white/[0.06]">
                  <button onClick={() => setActivePadId(null)} className="ui-button w-full h-[48px] bg-white/[0.05] border-white/[0.1] text-[var(--color-text)]">
                    Close Mapping
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-[40px]">
                 <div className="grid grid-cols-2 gap-[16px]">
                   <div className="ui-card text-center p-[24px]">
                      <div className="text-3xl font-bold italic mb-2 text-[var(--color-text)]">{loadedCount}</div>
                      <div className="text-micro text-[var(--color-text)]">Loaded</div>
                   </div>
                   <div className="ui-card text-center p-[24px]">
                      <div className="text-3xl font-bold italic mb-2 text-[var(--color-text)]">{16 - loadedCount}</div>
                      <div className="text-micro text-[var(--color-text)]">Empty</div>
                   </div>
                 </div>

                 <div className="space-y-[16px]">
                    <h4 className="text-app-label">Memory Profile</h4>
                    <div className="ui-card p-[24px]">
                       <p className="text-[11px] leading-relaxed font-semibold uppercase tracking-tight text-[var(--color-text)] italic">
                          Session anchored to browser heap. Avoid high-fidelity master injections for optimal latency performance.
                       </p>
                    </div>
                 </div>

                 <button onClick={() => navigate('/library')} 
                   className="ui-button w-full h-[56px] text-micro tracking-[0.2em] shadow-lg">
                    <Upload className="w-4 h-4" /> Import Source
                 </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

