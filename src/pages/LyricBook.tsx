import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { BookOpen, Plus, Music, ChevronRight, Quote, Star, Activity, Zap, Download } from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';
import type { LyricLine } from '../types/lyrics';
import { alignLyricsToOnsets } from '../lib/audioAnalysis';

export default function LyricBook() {
  useSEO('Lyric Book & SRT Sync', 'Professional lyric editor with transient-based audio sync and SRT subtitle export.');
  const { tracks, lyricBooks, activeTrackId, setActiveTrackId, saveLyricBook, addShareableItem, globalAudioRef } = useProfile();

  const activeTrack = tracks.find(t => t.id === activeTrackId);

  // If no track is selected, default to a global "Scratchpad"
  const currentBook = lyricBooks.find(b => b.trackId === (activeTrackId || 'global')) || {
    id: `lyrics-${activeTrackId || 'global'}`,
    trackId: activeTrackId || 'global',
    title: activeTrack?.title || 'Global Scratchpad',
    content: '',
    updatedAt: Date.now()
  };

  const [selectedText, setSelectedText] = useState('');
  const [localContent, setLocalContent] = useState(currentBook.content || '');
  const [syncMode, setSyncMode] = useState<'line' | 'word'>('line');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const generateSyncCalibration = () => {
     if (!activeTrack || !globalAudioRef.current) return;
     const dur = globalAudioRef.current.duration || activeTrack.duration || 120;
     
     // Prefer real onset timestamps from IngestEngine if available
     const storedOnsets = activeTrack.analysisData?.onsets;

     let tokens: string[] = [];
     if (syncMode === 'line') {
        tokens = localContent.split('\n').filter(l => l.trim().length > 0);
     } else {
        tokens = localContent.split(/\s+/).filter(w => w.trim().length > 0);
     }

     if (tokens.length === 0) return;

     let newSyncLines: LyricLine[];

     if (storedOnsets && storedOnsets.length > 0 && syncMode === 'line') {
        // Use real onset timestamps from the ingest pipeline
        newSyncLines = alignLyricsToOnsets(localContent, storedOnsets, dur).map((s, i) => ({
          id: `sync-${i}`,
          text: s.text,
          startTime: s.startTime,
          endTime: s.endTime,
        }));
     } else {
        // Fallback: deterministic even distribution
        const timePerToken = dur / tokens.length;
        newSyncLines = tokens.map((text, i) => ({
           id: `sync-${i}`,
           text,
           startTime: i * timePerToken,
           endTime: (i + 1) * timePerToken
        }));
     }

     saveLyricBook({
        ...currentBook,
        content: localContent,
        syncLines: newSyncLines,
        updatedAt: Date.now()
     });
     const src = storedOnsets?.length ? 'onset anchors' : 'even distribution';
     alert(`Calibrated ${newSyncLines.length} ${syncMode}s across ${dur.toFixed(1)}s using ${src}.`);
  };

  // Auto-sync: when a track with onset data is selected and lyrics exist, fire automatically
  useEffect(() => {
    if (!activeTrack?.analysisData?.onsets?.length) return;
    if (!localContent.trim()) return;
    const existingBook = lyricBooks.find(b => b.trackId === activeTrack.id);
    if (existingBook?.syncLines?.length) return; // Already synced - don't overwrite
    const onsets = activeTrack.analysisData.onsets;
    const dur = activeTrack.duration || 120;
    const synced = alignLyricsToOnsets(localContent, onsets, dur).map((s, i) => ({
      id: `sync-${i}`,
      text: s.text,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
    if (synced.length > 0) {
      saveLyricBook({ ...currentBook, content: localContent, syncLines: synced, updatedAt: Date.now() });
    }
  }, [activeTrackId, localContent]);

  // SRT export
  const exportSRT = () => {
    const book = lyricBooks.find(b => b.trackId === (activeTrackId || 'global'));
    if (!book?.syncLines?.length) { alert('Run sync calibration first.'); return; }
    const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
    const toSRT = (s: number) => {
      const h = pad(s / 3600); const m = pad((s % 3600) / 60); const sec = pad(s % 60);
      const ms = String(Math.round((s % 1) * 1000)).padStart(3, '0');
      return `${h}:${m}:${sec},${ms}`;
    };
    const content = book.syncLines.map((l, i) =>
      `${i + 1}\n${toSRT(l.startTime)} --> ${toSRT(l.endTime)}\n${l.text}\n`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/srt' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${activeTrack?.title || 'lyrics'}.srt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Sync Content to Local State when track switches
  useEffect(() => {
    setLocalContent(currentBook.content || '');
  }, [activeTrackId, currentBook.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    saveLyricBook({
      ...currentBook,
      content: e.target.value,
      updatedAt: Date.now()
    });
  };

  const handleTextSelection = () => {
    if (textAreaRef.current) {
      const s = textAreaRef.current.value.substring(textAreaRef.current.selectionStart, textAreaRef.current.selectionEnd);
      if (s.trim().length > 0) setSelectedText(s.trim());
    }
  };

  const handleAddQuote = () => {
    if (!selectedText) return;

    addShareableItem({
      type: 'lyric',
      title: `"${selectedText}"`,
      subtitle: `${activeTrack?.title || 'Track'} - Lyric Snippet`,
      sourceId: activeTrackId || 'global',
      isVisible: true,
      sortOrder: 0
    });
    setSelectedText('');
  };

  // Allow deselecting the active track to return to global scratchpad
  const toggleTrack = (id: string) => {
    if (activeTrackId === id) setActiveTrackId(null);
    else setActiveTrackId(id);
  };


  return (
    <div className="flex flex-col gap-[24px] w-full min-h-[800px]">
      <div className="page-header">
        <span className="text-app-label">Composition</span>
        <h1 className="text-page-title">Lyric Book</h1>
        <p className="text-body max-w-lg">
          {activeTrackId ? activeTrack?.title : 'Global Scratchpad'}
        </p>
      </div>

      <div className="ui-panel p-0 flex flex-col lg:flex-row h-[700px] overflow-hidden">
        
        {/* LEFT RAIL: TRACKS NAVIGATION */}
        <aside className="w-[260px] shrink-0 border-r border-white/[0.06] flex flex-col h-full overflow-y-auto bg-[var(--color-bg-panel)]">
          <nav className="p-[24px] space-y-[24px] flex-1 select-none">
            {/* Context Selection */}
            <div>
              <div className="mb-[12px] text-app-label">Context</div>
              <div className="space-y-[8px]">
                <button onClick={() => setActiveTrackId(null)}
                  className={cn('relative flex w-full items-center justify-between rounded-[8px] p-[12px] transition-colors',
                    !activeTrackId ? 'bg-white/[0.1] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text)] hover:bg-white/[0.04]')}>
                  <span className="truncate text-micro font-semibold">Global Scratchpad</span>
                  <ChevronRight className={cn('w-4 h-4 shrink-0', !activeTrackId ? 'text-[var(--color-text)]' : 'text-[var(--color-text)]')} />
                </button>
              </div>
            </div>

            <div>
              <div className="mb-[12px] text-app-label">Project Tracks</div>
              <div className="space-y-[8px]">
                {tracks.length === 0 ? (
                  <div className="p-[16px] text-micro text-[var(--color-text)] border border-dashed border-white/[0.06] rounded-[8px] text-center">
                    None loaded
                  </div>
                ) : tracks.map(track => (
                  <button key={track.id} onClick={() => toggleTrack(track.id)}
                    className={cn('relative flex w-full items-center justify-between rounded-[8px] p-[12px] transition-colors text-left',
                      activeTrackId === track.id ? 'bg-white/[0.1] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text)] hover:bg-white/[0.04] hover:text-[var(--color-text)]')}>
                    <div className="min-w-0 pr-2 space-y-1">
                      <p className="truncate text-micro font-semibold">{track.title}</p>
                      <p className="truncate text-[10px] text-[var(--color-text)] uppercase tracking-widest">{track.category}</p>
                    </div>
                    <ChevronRight className={cn('w-4 h-4 shrink-0', activeTrackId === track.id ? 'text-[var(--color-text)]' : 'text-[var(--color-text)]')} />
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-[24px] border-t border-white/[0.06] shrink-0 bg-[var(--color-bg-panel)]">
            <div className="flex items-center gap-[8px] mb-[12px] text-app-label">
              <Star className="w-3 h-3 text-[#7ca2ff]" /> Operational Tip
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--color-text)] font-medium italic">
              Highlight verses in the engine to instantly formalize snippets for the Link Vault.
            </p>
          </div>
        </aside>

        {/* MAIN EDITOR PANEL */}
        <div className="flex-1 p-[32px] overflow-y-auto relative border-r border-white/[0.06] bg-[var(--color-bg)]">
          <div className="max-w-2xl mx-auto h-full">
            <textarea
              ref={textAreaRef}
              onSelect={handleTextSelection}
              onChange={handleTextChange}
              value={localContent}
              className="w-full h-full min-h-[600px] text-[20px] font-serif italic leading-[1.8] outline-none resize-none bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text)]"
              placeholder={activeTrackId ? "Type the lyrics for this track..." : "Write anything... A concept, a verse, or a full song..."}
            />
          </div>
        </div>

        {/* RIGHT PANEL: OPERATIONAL TOOLS */}
        <aside className="w-[300px] p-[24px] space-y-[24px] overflow-y-auto select-none border-l border-white/[0.06] bg-[var(--color-bg-panel)]">
          <section>
            <h3 className="text-app-label mb-[16px] flex items-center gap-[8px]">
              <Activity className="w-4 h-4 text-[var(--color-text)]" /> Sync Calibration
            </h3>
            <div className="ui-card flex flex-col gap-[16px]">
              <p className="text-[11px] text-[var(--color-text)] leading-relaxed">
                Compute deterministic event timings across the sovereign track duration.
              </p>
              
              <div className="flex bg-white/[0.02] p-1 rounded-[8px] border border-white/[0.06]">
                <button 
                  onClick={() => setSyncMode('line')}
                  className={cn("flex-1 text-[11px] font-bold uppercase tracking-widest py-2 rounded-[6px] transition-all", syncMode === 'line' ? "bg-white/[0.1] text-white shadow-sm" : "text-white/50 hover:text-white")}
                >
                  Line by Line
                </button>
                <button 
                  onClick={() => setSyncMode('word')}
                  className={cn("flex-1 text-[11px] font-bold uppercase tracking-widest py-2 rounded-[6px] transition-all", syncMode === 'word' ? "bg-white/[0.1] text-white shadow-sm" : "text-white/50 hover:text-white")}
                >
                  Word by Word
                </button>
              </div>

              <button 
                onClick={generateSyncCalibration} 
                disabled={!activeTrackId || localContent.trim().length === 0}
                className="ui-button w-full h-[40px] disabled:opacity-50"
              >
                <Zap className="w-4 h-4" /> Execute Math
              </button>

              {/* Onset status indicator */}
              {activeTrack?.analysisData?.onsets?.length ? (
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3" /> {activeTrack.analysisData.onsets.length} real onset anchors ready
                </p>
              ) : activeTrackId ? (
                <p className="text-[10px] text-amber-500/60 uppercase tracking-widest">
                  Using even distribution - re-upload to get onset anchors
                </p>
              ) : null}

              {/* SRT Export */}
              <button
                onClick={exportSRT}
                disabled={!lyricBooks.find(b => b.trackId === (activeTrackId || 'global'))?.syncLines?.length}
                className="w-full h-[40px] flex items-center justify-center gap-2 rounded-[8px] border border-white/[0.08] text-[11px] font-bold uppercase tracking-widest text-[var(--color-text)] hover:bg-white/[0.04] transition-all disabled:opacity-30"
              >
                <Download className="w-3.5 h-3.5" /> Export .SRT
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-app-label mb-[16px] flex items-center gap-[8px]">
              <Quote className="w-4 h-4 text-[var(--color-text)]" /> Formal Metadata
            </h3>
            <div className="ui-card flex flex-col">
              {selectedText ? (
                <div className="mb-[24px]">
                  <p className="text-[13px] font-serif italic leading-relaxed text-[var(--color-text)]">"{selectedText}"</p>
                </div>
              ) : (
                <p className="text-body mb-[24px] text-[var(--color-text)]">
                  Select text in the editor to extract.
                </p>
              )}
              <button 
                onClick={handleAddQuote} 
                disabled={!selectedText}
                className="ui-button w-full h-[40px] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Export to Vault
              </button>
            </div>
          </section>
        </aside>

      </div>
    </div>
  );
}

