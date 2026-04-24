import React, { useState } from 'react';
import { Zap, Play, Layers, Sliders, Activity, Sparkles, Plus, Music, Speaker, CheckCircle2, Disc, Map, Square, Download, Link2 } from '../lib/icons';
import { cn, audioBufferToWav } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { getAudioFile } from '../lib/storage';
import { useSEO } from '../lib/useSEO';
import { useOmniRack, DEFAULT_RACK_PARAMS, renderOfflineDSP } from '../lib/useOmniRack';
import { useLocation } from '../lib/router';
import { motion, AnimatePresence } from 'motion/react';
import type { OmniRackParams } from '../lib/useOmniRack';
import { extractAudioIntelligence } from '../lib/VektrLabContext';
import type { AudioIntelligenceProfile } from '../lib/VektrLabContext';

export default function VektrLab() {
  useSEO('12-Band Mastering Suite', 'High-functioning audio mastering suite with 29-node DSP rack and professional presets.');
  const { profile, activeTrackId, setActiveTrackId, tracks, isPlaying, togglePlay, rackParams, updateRackParams } = useProfile();
  const activeTrack = tracks.find(t => t.id === activeTrackId);
  const location = useLocation();

  type RackTarget = 'transport' | 'dynamics' | 'filters' | 'graphic' | 'space' | 'mod' | 'spatial3d';
  const [activeRack, setActiveRack] = useState<RackTarget>('transport');
  const [isExporting, setIsExporting] = useState(false);
  
  const [intelligence, setIntelligence] = useState<AudioIntelligenceProfile | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  React.useEffect(() => {
     if (!activeTrack) { setIntelligence(null); return; }
     const runAnalysis = async () => {
        setAnalyzing(true);
        try {
           const blob = await getAudioFile(activeTrack.id);
           if (!blob) return;
           const arrayBuffer = await blob.arrayBuffer();
           const offlineCtx = new OfflineAudioContext(2, 44100, 44100);
           const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
           const intel = await extractAudioIntelligence(audioBuffer);
           setIntelligence(intel);
        } catch(e) {
           console.error(e);
        } finally {
           setAnalyzing(false);
        }
     };
     runAnalysis();
  }, [activeTrack]);

  const applyDynamicPreset = (presetName: string) => {
    switch (presetName) {
      case 'Tight Vox':
        updateRackParams({ ...DEFAULT_RACK_PARAMS, filtersActive: true, hpfCutoff: 150, hpfRes: 2 });
        break;
      case 'Acoustic Sparkle':
        const sparkleEq = [...DEFAULT_RACK_PARAMS.eqBands];
        sparkleEq[8] = 2; sparkleEq[9] = 4; sparkleEq[10] = 6; sparkleEq[11] = 4;
        updateRackParams({ ...DEFAULT_RACK_PARAMS, graphicActive: true, eqBands: sparkleEq });
        break;
      case 'Sub Sculptor':
        updateRackParams({ ...DEFAULT_RACK_PARAMS, dynamicsActive: true, saturation: 20 });
        break;
      case 'Cinematic Wide':
        updateRackParams({ ...DEFAULT_RACK_PARAMS, spaceActive: true, reverbMix: 40 });
        break;
    }
  };

  const setParam = (key: keyof OmniRackParams, val: any) => updateRackParams({ [key]: val });

  const handleTogglePlay = () => {
    if (!activeTrack?.fileUrl) return;
    togglePlay();
  };

  const handleCommitRender = async () => {
    if (!activeTrack?.fileUrl) return;
    setIsExporting(true);
    try {
      let arrayBuffer: ArrayBuffer;
      try {
        const response = await fetch(activeTrack.fileUrl);
        arrayBuffer = await response.arrayBuffer();
      } catch {
        // Blob URL expired after page reload - recover from IndexedDB
        const blob = await getAudioFile(activeTrack.id);
        if (!blob) { alert('Source file not available - re-upload required.'); setIsExporting(false); return; }
        arrayBuffer = await blob.arrayBuffer();
      }
      const offlineCtx = new OfflineAudioContext(2, 44100, 44100);
      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
      
      const renderedBuffer = await renderOfflineDSP(audioBuffer, rackParams);
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Vektr_Master_${activeTrack.title.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Render failed:", error);
      alert("DSP Engine failed to commit render.");
    } finally {
      setIsExporting(false);
    }
  };

  const Knob = ({ val, set, label, min=0, max=100, step=1, unit='%' }: any) => (
    <div className="flex flex-col items-center gap-2 group min-w-[80px]">
      <span className="text-[10px] font-black text-amber-500 font-mono tabular-nums">{val > 0 ? `+${val}` : val}{unit}</span>
      <div className="w-full px-1">
        <input
          type="range" min={min} max={max} step={step} value={val}
          onChange={e => set(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-amber-500"
          style={{ accentColor: '#f59e0b' }}
        />
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center leading-tight text-[var(--color-text)]">{label}</span>
    </div>
  );

  if (!activeTrack) {
    return (
      <div className={cn("flex-1 flex flex-col items-center justify-center h-full transition-colors", "bg-bg")}>
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border mb-6 group hover:scale-110 transition-transform duration-500",
          "bg-amber-500/10 border-amber-500/20")}>
           <Zap className="w-8 h-8 text-amber-500 shadow-xl" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 italic text-[var(--color-text)]">Axiometric Lab</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-[var(--color-text)]">Select vault telemetry source to begin DSP operations.</p>
        <div className="w-full max-w-sm">
           <select 
             value={activeTrackId || ''} 
             onChange={(e) => setActiveTrackId(e.target.value)}
             className="w-full p-4 border rounded-xl text-xs font-bold outline-none focus:ring-1 transition-all cursor-pointer appearance-none bg-white/[0.03] border-white/10 text-[var(--color-text)] focus:ring-amber-500">
             <option value="" disabled className="bg-[var(--color-bg-panel)]">Select Segment</option>
             {tracks.map(t => (
               <option key={t.id} value={t.id} className="bg-[var(--color-bg-panel)] text-[var(--color-text)]">{t.title}</option>
             ))}
           </select>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden h-full flex flex-col transition-colors duration-500 bg-bg">
      {/* Top Ambient Bar */}
      <div className="h-14 border-b border-white/10 bg-[var(--color-bg-panel)]/40 flex items-center justify-between px-8 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Quantum Studio
          </div>
           <div className="h-4 w-px bg-zinc-200/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)]">
            <Activity className="w-3 h-3" /> DSP_SIGNAL: {activeTrack ? 'LOCKED' : 'IDLE'}
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
             Axiometric_Sync_Active
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative z-10">
        
        {/* LEFT RAIL: MONITOR */}
        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 border-r border-white/5 bg-white/[0.01] flex flex-col h-full overflow-y-auto">
          <header className="p-8 border-b border-white/5 bg-white/[0.01]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500 mb-2">
               Source Monitor
            </div>
            <h1 className="text-3xl font-semibold tracking-tight uppercase italic text-[var(--color-text)]">
              Vektr Lab
            </h1>
          </header>

          <div className="p-8 space-y-8 flex-1">
             <div onClick={handleTogglePlay} className="w-full aspect-square rounded-2xl border border-white/10 bg-[var(--color-bg-panel)] flex items-center justify-center relative group cursor-pointer overflow-hidden shadow-2xl">
                <img src={activeTrack.thumbnailUrl} className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-700", isPlaying ? "opacity-50 blur-sm scale-110" : "opacity-20 grayscale")} />
                
                {rackParams.audio8dActive && isPlaying && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: (100 - rackParams.speed8d + 10) / 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[110%] h-[110%] rounded-full border border-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]" />
                    <div className="absolute top-0 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)]" />
                  </motion.div>
                )}

                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl z-10 group-hover:scale-105 transition-transform">
                  {isPlaying ? <Square className="w-4 h-4 fill-black" /> : <Play className="w-5 h-5 ml-1 fill-black" />}
                </div>
             </div>

             <div className="space-y-1">
                <h3 className="font-bold text-lg truncate text-[var(--color-text)] uppercase italic tracking-tighter">{activeTrack.title}</h3>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Axiometric Processing active</p>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] flex items-center justify-between">
                  <span>Dynamic Recipes</span>
                  {analyzing && <Activity className="w-3 h-3 animate-pulse text-amber-500" />}
                </h4>
                
                {intelligence && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                     <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Audio Intelligence
                     </p>
                     <div className="grid grid-cols-2 gap-2 text-[10px] text-amber-500 font-mono">
                        <div>BPM: {intelligence.bpm}</div>
                        <div>KEY: {intelligence.key} ({intelligence.camelot})</div>
                        <div className="col-span-2">GENRE GUESSTIMATE: {intelligence.genre}</div>
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {(intelligence ? intelligence.suggestions : []).map(s => (
                    <button key={s.presetName} onClick={() => applyDynamicPreset(s.presetName)}
                      className="w-full py-3 px-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 transition-all text-left flex flex-col group relative overflow-hidden">
                      <div className="flex w-full items-center justify-between mb-1">
                        <span>[AI] {s.presetName}</span>
                        <Zap className="w-3 h-3" />
                      </div>
                      <span className="text-[8px] tracking-normal font-medium text-amber-500/70 lowercase normal-case leading-tight">{s.reason}</span>
                    </button>
                  ))}

                  {[
                    { label: 'Cyberpunk Crunch', params: {...DEFAULT_RACK_PARAMS, dynamicsActive: true, saturation: 80, compression: -30, bitcrush: 8, lpfCutoff: 3000, filtersActive: true} },
                    { label: 'Vintage Vinyl', params: {...DEFAULT_RACK_PARAMS, transportActive: true, vinylPitch: 85, filtersActive: true, lpfCutoff: 4000, lpfRes: 2, spaceActive: true, reverbMix: 15} },
                    { label: '8D Immersion', params: {...DEFAULT_RACK_PARAMS, audio8dActive: true, spaceActive: true, reverbMix: 30} }
                  ].map(p => (
                    <button key={p.label} onClick={() => updateRackParams(p.params)}
                      className="w-full py-3 px-4 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-white/[0.08] transition-all text-left flex items-center justify-between group">
                      {p.label}
                      <Zap className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                  <button onClick={() => updateRackParams(DEFAULT_RACK_PARAMS)}
                    className="w-full py-3 px-4 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-text)] transition-all text-left">
                    Master Reset
                  </button>
                </div>
             </div>
          </div>

           <div className="p-8 border-t border-white/5 bg-white/[0.01]">
             <button 
               onClick={handleCommitRender}
               disabled={isExporting}
               className="w-full py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 shadow-2xl disabled:opacity-50">
                {isExporting ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Download className="w-3.5 h-3.5" />} 
                {isExporting ? 'Bouncing Audio...' : 'Commit Render'}
             </button>
          </div>
        </div>

        {/* MAIN PANEL: RACK CONTROLS */}
         <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          
          <div className="flex border-b border-white/5 bg-[var(--color-bg-card)] p-2 shrink-0 overflow-x-auto hide-scrollbar">
            {[
              { id: 'transport', label: 'Transport', icon: Zap },
              { id: 'dynamics', label: 'Dynamics', icon: Activity },
              { id: 'filters', label: 'Filters', icon: Sliders },
              { id: 'graphic', label: 'Graphic EQ', icon: Layers },
              { id: 'space', label: 'Ambience', icon: Speaker },
              { id: 'mod', label: 'Modulation', icon: Disc },
              { id: 'spatial3d', label: '8D Space', icon: Map }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveRack(tab.id as any)}
                 className={cn("px-5 py-3 flex items-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] transition-all rounded-lg",
                   activeRack === tab.id 
                    ? "bg-white text-black shadow-2xl"
                    : "text-[var(--color-text)] hover:text-[var(--color-text)]"
                 )}>
                 <tab.icon className="w-3.5 h-3.5" strokeWidth={3} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-12 bg-[#050505]">
             <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                   <motion.div key={activeRack} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    
                    {/* Rack Toggle */}
                    <div className="flex justify-between items-center p-6 ui-panel mb-8">
                       <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner", 
                            rackParams[(activeRack === 'spatial3d' ? 'audio8dActive' : activeRack === 'transport' ? 'transportActive' : activeRack === 'dynamics' ? 'dynamicsActive' : activeRack === 'filters' ? 'filtersActive' : activeRack === 'graphic' ? 'graphicActive' : activeRack === 'space' ? 'spaceActive' : 'modActive') as keyof OmniRackParams] ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-[var(--color-text)]"
                          )}>
                             {activeRack === 'transport' && <Zap className="w-5 h-5" />}
                             {activeRack === 'dynamics' && <Activity className="w-5 h-5" />}
                             {activeRack === 'filters' && <Sliders className="w-5 h-5" />}
                             {activeRack === 'graphic' && <Layers className="w-5 h-5" />}
                             {activeRack === 'space' && <Speaker className="w-5 h-5" />}
                             {activeRack === 'mod' && <Disc className="w-5 h-5" />}
                             {activeRack === 'spatial3d' && <Sparkles className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)]">Module Power</h3>
                            <p className="text-[10px] font-bold uppercase text-[var(--color-text)]">Anchor DSP thread to current rack parameters</p>
                          </div>
                       </div>
                       <button onClick={() => {
                          const key = (activeRack === 'spatial3d' ? 'audio8dActive' : activeRack === 'transport' ? 'transportActive' : activeRack === 'dynamics' ? 'dynamicsActive' : activeRack === 'filters' ? 'filtersActive' : activeRack === 'graphic' ? 'graphicActive' : activeRack === 'space' ? 'spaceActive' : 'modActive') as keyof OmniRackParams;
                          setParam(key, !rackParams[key]);
                       }}
                       className={cn("w-12 h-6 rounded-full transition-all relative", 
                         rackParams[(activeRack === 'spatial3d' ? 'audio8dActive' : activeRack === 'transport' ? 'transportActive' : activeRack === 'dynamics' ? 'dynamicsActive' : activeRack === 'filters' ? 'filtersActive' : activeRack === 'graphic' ? 'graphicActive' : activeRack === 'space' ? 'spaceActive' : 'modActive') as keyof OmniRackParams] ? "bg-amber-500" : "bg-white/10"
                       )}>
                         <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", 
                           rackParams[(activeRack === 'spatial3d' ? 'audio8dActive' : activeRack === 'transport' ? 'transportActive' : activeRack === 'dynamics' ? 'dynamicsActive' : activeRack === 'filters' ? 'filtersActive' : activeRack === 'graphic' ? 'graphicActive' : activeRack === 'space' ? 'spaceActive' : 'modActive') as keyof OmniRackParams] ? "right-1" : "left-1"
                         )} />
                       </button>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-[var(--color-bg-panel)]/40 mb-10 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-2xl text-[var(--color-text)] shadow-sm">
                       Axiometric DSP commands the system's internal C++ Runtime to process signal natively. 
                       Zero-latency performance anchored to browser thread.
                    </div>

                    <div className={cn("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-12 gap-x-4 justify-items-center transition-all duration-500", 
                      !rackParams[(activeRack === 'spatial3d' ? 'audio8dActive' : activeRack === 'transport' ? 'transportActive' : activeRack === 'dynamics' ? 'dynamicsActive' : activeRack === 'filters' ? 'filtersActive' : activeRack === 'graphic' ? 'graphicActive' : activeRack === 'space' ? 'spaceActive' : 'modActive') as keyof OmniRackParams] && 'opacity-20 grayscale pointer-events-none'
                    )}>
                       {activeRack === 'transport' && (
                         <>
                           <Knob val={rackParams.tempo} set={(v: number) => setParam('tempo', v)} label="Time Stretch" min={50} max={200} />
                           <Knob val={rackParams.vinylPitch} set={(v: number) => setParam('vinylPitch', v)} label="Vinyl Pitch" min={50} max={200} />
                         </>
                       )}
                       {activeRack === 'graphic' && rackParams.eqBands.map((vol, i) => (
                         <Knob key={i} val={vol} set={(v: number) => {
                           const n = [...rackParams.eqBands]; n[i] = v; setParam('eqBands', n);
                         }} label={['30','60','120','250','500','1k','2k','4k','8k','12k','16k','20k'][i] + ' Hz'} min={-12} max={12} unit="dB" />
                       ))}
                       {activeRack === 'spatial3d' && (
                         <>
                           <Knob val={rackParams.speed8d} set={(v: number) => setParam('speed8d', v)} label="Orbital Speed" />
                           <Knob val={rackParams.radius8d} set={(v: number) => setParam('radius8d', v)} label="Orbital Radius" max={50} unit="m" />
                         </>
                       )}
                       {activeRack === 'dynamics' && (
                         <>
                           <Knob val={rackParams.gateThresh} set={(v: number) => setParam('gateThresh', v)} label="Noise Gate" unit="%" />
                           <Knob val={rackParams.compression} set={(v: number) => setParam('compression', v)} label="Compressor" />
                           <Knob val={rackParams.saturation} set={(v: number) => setParam('saturation', v)} label="Saturation" />
                           <Knob val={rackParams.bitcrush} set={(v: number) => setParam('bitcrush', v)} label="Bit Crusher" min={1} max={16} unit=" Bit" />
                           <Knob val={rackParams.limiter} set={(v: number) => setParam('limiter', v)} label="Brick Limiter" />
                         </>
                       )}
                       {activeRack === 'filters' && (
                         <>
                           <Knob val={rackParams.lpfCutoff} set={(v: number) => setParam('lpfCutoff', v)} label="Lowpass Freq" />
                           <Knob val={rackParams.lpfRes} set={(v: number) => setParam('lpfRes', v)} label="LP Res" max={20} unit=" Q" />
                           <Knob val={rackParams.hpfCutoff} set={(v: number) => setParam('hpfCutoff', v)} label="Highpass Freq" />
                           <Knob val={rackParams.hpfRes} set={(v: number) => setParam('hpfRes', v)} label="HP Res" max={20} unit=" Q" />
                           <Knob val={rackParams.bpfFreq} set={(v: number) => setParam('bpfFreq', v)} label="Bandpass Freq" />
                           <Knob val={rackParams.notchFreq} set={(v: number) => setParam('notchFreq', v)} label="Notch Limit" />
                         </>
                       )}
                       {activeRack === 'space' && (
                         <>
                           <Knob val={rackParams.reverbMix} set={(v: number) => setParam('reverbMix', v)} label="Convolver Reverb" />
                           <Knob val={rackParams.echoTime} set={(v: number) => setParam('echoTime', v)} label="Echo Time" />
                           <Knob val={rackParams.echoFbk} set={(v: number) => setParam('echoFbk', v)} label="Echo Feedback" />
                           <Knob val={rackParams.echoMix} set={(v: number) => setParam('echoMix', v)} label="Delay Mix" />
                         </>
                       )}
                       {activeRack === 'mod' && (
                         <>
                           <Knob val={rackParams.chorusRate} set={(v: number) => setParam('chorusRate', v)} label="Chorus Sweep" />
                           <Knob val={rackParams.chorusMix} set={(v: number) => setParam('chorusMix', v)} label="Chorus Depth" />
                           <Knob val={rackParams.flangerRate} set={(v: number) => setParam('flangerRate', v)} label="Jet-Plane Speed" />
                           <Knob val={rackParams.flangerMix} set={(v: number) => setParam('flangerMix', v)} label="Flanger Mix" />
                         </>
                       )}
                    </div>
                  </motion.div>
                </AnimatePresence>
             </div>
          </div>
          
           <div className="p-8 border-t border-white/5 bg-white/[0.01]">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center tabular-nums opacity-20 text-[var(--color-text)]">
               QUANTUM_CHAIN: GATE {'->'} FILTERS {'->'} 12B-EQ {'->'} CRUSH {'->'} COMP {'->'} DIST {'->'} PARALLEL(SPACE & MOD) {'->'} LIMITER {'->'} 8D PANNER
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

