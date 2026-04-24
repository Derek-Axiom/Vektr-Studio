import React, { useState } from 'react';
import { LayoutTemplate, Plus, Download, ChevronDown, Sparkles, User, BookOpen, Square, Zap, CheckCircle2, Quote, Type, Music } from '../lib/icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';
import { exportElementAsPNG } from '../lib/htmlExport';

export default function ContentKit() {
  useSEO('Social Asset Kit', 'Generate professional 4K social promo assets from your tracks and lyrics with cinematic templates.');
  const { activeTrackId, setActiveTrackId, tracks, profile, addShareableItem, shareableItems, lyricBooks } = useProfile();
  const activeTrack = tracks.find(t => t.id === activeTrackId);
  const activeLyrics = lyricBooks.find(b => b.trackId === activeTrackId);
  const parsedLyrics = activeLyrics?.content?.split('\n').filter(l => l.trim().length > 0) || [];
  
  const displayQuote = parsedLyrics.length > 0 ? `"${parsedLyrics[0].toUpperCase()}"` : '"THE VIBRATION\nIS IMMORTAL"';
  const displayLyricSplit = parsedLyrics.length > 1 ? [`"${parsedLyrics[0]},`, `${parsedLyrics[1]}."`] : ['"We built this in the shadows,', 'Now we own the light."'];
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState('2');
  const [isExporting, setIsExporting] = useState(false);

  const categories = ['All', 'Social', 'Release', 'Lyric', 'Identity'];
  const templates = [
    { id: '1', title: 'Bio Card', category: 'Identity', icon: User, desc: 'Aesthetic artist profile snapshot.' },
    { id: '2', title: 'Release Card', category: 'Release', icon: Square, desc: 'High-end streaming announcement.' },
    { id: '3', title: 'Quote Card', category: 'Release', icon: Type, desc: 'Clean typographic layout for artist statements.' },
    { id: '4', title: 'Lyric Poster', category: 'Social', icon: Music, desc: 'Atmospheric quote card from active lyric book.' }
  ];

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)?.title || 'Release Card';

  const filtered = activeCategory === 'All' ? templates : templates.filter(t => t.category === activeCategory);

  const handleAddToBio = () => {
    addShareableItem({
      type: 'visual', 
      title: `${activeTrack?.title || 'Generative'} - ${selectedTemplate}`,
      subtitle: `Content Kit - ${selectedTemplate}`,
      thumbnail: activeTrack?.thumbnailUrl || '',
      sourceId: activeTrack?.id || `content-${Date.now()}`, 
      isVisible: true, 
      sortOrder: 0
    });
  };

  const handleExport = async () => {
    const el = document.getElementById('export-canvas-target');
    if (!el) return;
    setIsExporting(true);
    try {
      await exportElementAsPNG(el, `ASSET_${selectedTemplate.replace(/\s+/g, '_')}_4K.png`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Render Dynamic HTML Asset Templates
  const renderDynamicAsset = () => {
    switch (selectedTemplate) {
      case 'Release Card':
        const releaseLinks = shareableItems.filter(i => i.isVisible && i.sourceId === activeTrack?.id).slice(0, 2);
        const displayLinks = releaseLinks.length > 0 ? releaseLinks : [
          { title: 'Listen on Spotify', url: '#', isPrimary: true },
          { title: 'Apple Music', url: '#', isPrimary: false }
        ];

        return (
          <div className="absolute inset-0 bg-[var(--color-bg-panel)] flex flex-col justify-end p-8 overflow-hidden group/canvas">
            <img src={activeTrack?.thumbnailUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 group-hover/canvas:scale-100 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="relative z-10 w-full">
              <div className="flex justify-between items-end w-full mb-6">
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter text-[var(--color-text)] mb-1 uppercase drop-shadow-lg">{activeTrack ? activeTrack.title : 'NO TRACK'}</h2>
                  <p className="text-[10px] text-[var(--color-text)] font-bold uppercase tracking-[0.2em]">{profile.displayName} - OUT NOW</p>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
                  <img src={activeTrack?.thumbnailUrl} alt="Mini Cover" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="flex gap-2 w-full">
                {displayLinks.map((link, idx) => (
                   <div key={idx} className={cn("flex-1 py-3 text-center rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl line-clamp-1 px-2", 
                      idx === 0 || (link as any).isPrimary ? "bg-white text-black" : "bg-[var(--color-bg-panel)]/40 backdrop-blur-md text-[var(--color-text)] border border-white/20"
                   )}>
                     {link.title}
                   </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Bio Card':
        const bioLinks = shareableItems.filter(i => i.isVisible && i.type === 'external_link').slice(0, 3);
        
        return (
          <div className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 overflow-hidden">
             <div className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_50%)] animate-[spin_60s_linear_infinite]" />
             
             <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-white/20 to-white/5 shadow-2xl mb-8 relative z-10">
               <img src={profile.avatarUrl} alt="Bio" className="w-full h-full rounded-full object-cover grayscale" />
             </div>
             
             <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)] mb-2 relative z-10">{profile.displayName}</h2>
             <p className="text-sm text-center font-medium text-[var(--color-text)] leading-relaxed max-w-[80%] relative z-10">{profile.bio || 'Artist Profile'}</p>
             
             <div className="mt-8 flex gap-3 relative z-10">
               <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[var(--color-text)] text-[9px] font-bold tracking-widest uppercase shadow-sm">Artist</div>
               <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[var(--color-text)] text-[9px] font-bold tracking-widest uppercase shadow-sm">Producer</div>
             </div>

             <div className="mt-6 flex flex-col gap-2 w-full px-8 relative z-10">
               {bioLinks.map(link => (
                 <div key={link.id} className="w-full py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-[var(--color-text)] text-[10px] font-bold uppercase tracking-widest text-center rounded-xl shadow-lg truncate px-4">
                   {link.title}
                 </div>
               ))}
               {bioLinks.length === 0 && (
                 <div className="w-full py-2.5 bg-white/5 border border-white/10 text-[var(--color-text)] text-[10px] font-bold uppercase tracking-widest text-center rounded-xl border-dashed">
                   Configure Links in Vault
                 </div>
               )}
             </div>
          </div>
        );

      case 'Quote Card':
        return (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-12 overflow-hidden border-8 border-black">
            <Quote className="w-10 h-10 text-black/20 absolute top-8 left-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-black text-center mb-8 relative z-10 mix-blend-difference whitespace-pre-wrap break-words w-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-black">{displayQuote}</span>
            </h2>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--color-bg-panel)] shrink-0">
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/60">{profile.displayName}</p>
            </div>
            
            <div className="absolute bottom-4 right-4 text-[8px] font-bold tracking-widest uppercase text-black/40">STUDIO - ASSET</div>
          </div>
        );

      case 'Lyric Poster':
        return (
          <div className="absolute inset-0 bg-[var(--color-bg-panel)] flex flex-col items-center justify-center p-8 overflow-hidden">
            <img src={activeTrack?.thumbnailUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110" />
            <div className="relative z-10 w-full h-full border border-white/20 p-8 flex flex-col justify-center">
              <p className="text-2xl font-medium italic text-[var(--color-text)] leading-relaxed text-center drop-shadow-xl mb-4">
                {displayLyricSplit[0]}<br/>{displayLyricSplit[1]}
              </p>
              <p className="text-center text-[10px] text-[var(--color-text)] uppercase font-bold tracking-[0.3em]">- {activeTrack ? activeTrack.title : 'STUDIO'}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-[24px] w-full min-h-[800px]">
      
      {/* 8. HEADER SYSTEM */}
      <div className="page-header">
         <span className="text-app-label">Publishing</span>
         <h1 className="text-page-title mb-[8px]">Content Kit</h1>
         <p className="text-body max-w-lg">One-click promotional asset renderer.</p>
      </div>

      <div className="ui-panel p-0 flex flex-col lg:flex-row h-[750px] overflow-hidden">
        
        {/* LEFT RAIL: TEMPLATE SELECTOR */}
        <aside className="w-[280px] shrink-0 border-r border-white/[0.06] bg-[var(--color-bg-panel)] flex flex-col h-full overflow-y-auto">
          <nav className="p-[24px] space-y-[24px] flex-1 select-none">
            {/* Categories */}
            <div>
              <div className="mb-[12px] text-app-label">Category</div>
              <div className="grid grid-cols-2 gap-[8px]">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={cn('px-3 py-2 rounded-[8px] text-micro tracking-wider transition-colors',
                      activeCategory === cat ? 'bg-white/[0.1] text-[var(--color-text)]' : 'text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-white/[0.04]')}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div>
              <div className="mb-[12px] text-app-label">Templates</div>
              <div className="space-y-[8px]">
                {filtered.map(template => (
                  <button key={template.id} onClick={() => setSelectedTemplateId(template.id)}
                    className={cn('relative flex w-full items-center gap-[12px] rounded-[8px] p-[12px] text-left transition-colors',
                      selectedTemplateId === template.id ? 'bg-white/[0.1] text-[var(--color-text)]' : 'text-[var(--color-text)] hover:bg-white/[0.04] hover:text-[var(--color-text)]')}>
                    <template.icon className={cn("w-4 h-4 shrink-0", selectedTemplateId === template.id ? "text-[#7ca2ff]" : "text-[var(--color-text)]")} />
                    <div className="min-w-0 pr-2">
                      <p className={cn("truncate text-micro font-semibold")}>{template.title}</p>
                      <p className="truncate text-[10px] text-[var(--color-text)] uppercase mt-0.5 tracking-widest">{template.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* MAIN PANEL: PRO RENDER ENGINE */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--color-bg)]">
          <header className="border-b border-white/[0.06] p-[24px] flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            
            <div className="flex flex-col gap-[8px]">
              <div className="text-app-label">Operational Render Engine</div>
              <div className="flex items-center gap-[16px]">
                <h2 className="text-section-title">{selectedTemplate}</h2>
                {activeTrack && (
                  <div className="relative group ui-card py-[4px] px-[12px] cursor-pointer">
                     <select 
                      value={activeTrackId || ''} 
                      onChange={(e) => setActiveTrackId(e.target.value)}
                      className="appearance-none pr-6 bg-transparent font-semibold text-micro text-[var(--color-text)] outline-none cursor-pointer"
                    >
                      {tracks.map(t => (
                        <option key={t.id} value={t.id} className="bg-[var(--color-bg)] text-[var(--color-text)]">{t.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text)] pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-[12px]">
              <button 
                onClick={handleExport} 
                disabled={isExporting} 
                className="ui-button h-[40px] px-[16px] text-micro disabled:opacity-50"
              >
                <Download className={cn("w-4 h-4", isExporting && "animate-spin")} /> 
                {isExporting ? 'Rendering...' : 'Export 4K'}
              </button>
              <button 
                onClick={handleAddToBio} 
                className="ui-button h-[40px] px-[16px] text-micro"
              >
                <Plus className="w-4 h-4" /> Publish to Bio
              </button>
            </div>
          </header>
          
          <div className="flex-1 flex flex-col items-center justify-center p-[40px] relative">
            <AnimatePresence mode="wait">
              <motion.div 
                id="export-canvas-target"
                key={selectedTemplate}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[400px] aspect-[4/5] bg-[var(--color-bg-panel)] shadow-2xl relative group overflow-hidden border border-white/[0.06]"
              >
                {renderDynamicAsset()}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-[40px]">
              <div className="flex items-center gap-[8px] text-[var(--color-text)]">
                 <CheckCircle2 className="w-4 h-4 text-[#7ca2ff]" />
                 <span className="text-[10px] font-black uppercase tracking-widest italic drop-shadow-md">Axiometric Verified 4K Output</span>
              </div>
            </footer>
          </div>
          
          {/* Track Guard */}
          {!activeTrack && selectedTemplate !== 'Bio Card' && (
            <div className="absolute inset-0 z-40 bg-[var(--color-bg-panel)]/95 backdrop-blur-md flex flex-col items-center justify-center p-[32px] text-center border-l border-white/[0.06]">
               <div className="w-[64px] h-[64px] rounded-[16px] bg-white/[0.05] border border-white/[0.1] shadow-2xl flex items-center justify-center mb-[24px]">
                 <LayoutTemplate className="w-[32px] h-[32px] text-[var(--color-text)]" />
               </div>
               <h2 className="text-section-title mb-[8px]">Track Alignment Required</h2>
               <p className="text-body max-w-sm mb-[32px]">
                 Generative output requires synchronized track metadata. Switch category or select a source.
               </p>
               <div className="w-full max-w-[280px] relative ui-card cursor-pointer">
                  <select 
                    value={activeTrackId || ''} 
                    onChange={(e) => setActiveTrackId(e.target.value)}
                    className="appearance-none w-full bg-transparent font-semibold text-[13px] text-[var(--color-text)] outline-none cursor-pointer px-[8px]"
                  >
                    <option value="" disabled className="bg-[var(--color-bg)] text-[var(--color-text)]">Select source...</option>
                    {tracks.map(t => (
                      <option key={t.id} value={t.id} className="bg-[var(--color-bg)] text-[var(--color-text)]">{t.title} ({t.category})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-[16px] top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text)] pointer-events-none" />
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

