import React, { useState, useRef, useMemo } from 'react';
import {
  Plus, Copy, Palette, List, Globe, User, Share2, Music, Video, Quote,
  ChevronLeft, Check, Trash2, GripVertical, Zap, CheckCircle2, Shield,
  Spotify, AppleMusic, SoundCloud, Instagram, Twitter, Youtube, ShoppingCart,
  Upload, Smartphone, Image as ImageIcon, Link2, X, Globe as GlobeIcon
} from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { cn, resizeImageToBase64 } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';
import { THEMES, THEME_CATEGORIES, type ThemeDefinition } from '../lib/themes';
import { ART_CanvasHash } from '../lib/ART_CanvasHasher';

const CARD_STYLES = [
  { id: 'glass', name: 'Glass', desc: 'Blur & Transparency' },
  { id: 'solid', name: 'Solid', desc: 'Flat & Opaque' },
  { id: 'outline', name: 'Outline', desc: 'Border Only' },
  { id: 'brutalist', name: 'Brutalist', desc: 'Raw & Shadowed' }
];

const FONTS = [
  { id: 'font-sans', name: 'Outfit', family: "'Outfit', sans-serif" },
  { id: 'font-inter', name: 'Inter', family: "'Inter', sans-serif" },
  { id: 'font-mono', name: 'Space Mono', family: "'Space Mono', monospace" },
  { id: 'font-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
];

const SOCIAL_PLATFORMS = [
  { id: 'spotify', name: 'Spotify', icon: Spotify, color: '#1DB954', placeholder: 'https://open.spotify.com/...' },
  { id: 'apple', name: 'Apple Music', icon: AppleMusic, color: '#FC3C44', placeholder: 'https://music.apple.com/...' },
  { id: 'soundcloud', name: 'SoundCloud', icon: SoundCloud, color: '#FF5500', placeholder: 'https://soundcloud.com/...' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', placeholder: 'https://instagram.com/...' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', placeholder: 'https://youtube.com/...' },
  { id: 'shop', name: 'Store', icon: ShoppingCart, color: '#FBBF24', placeholder: 'https://yourshop.com' },
  { id: 'generic', name: 'Website', icon: GlobeIcon, color: '#6366F1', placeholder: 'https://' },
];

// ─── Artist Theme Swatch Component ──────────────────────────────────────
function ThemeSwatchGrid({ themes, currentThemeId, onSelect }: {
  themes: ThemeDefinition[];
  currentThemeId: string;
  onSelect: (id: string) => void;
}) {
  const canvasBgs = useMemo(() => {
    const map: Record<string, string> = {};
    themes.forEach(t => {
      const hexToNum = (s: string) => {
        const cleaned = s.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).padEnd(6, '0');
        return parseInt(cleaned, 16) || 0;
      };
      const sat = (hexToNum(t.textColor) % 50) + 10;
      const clarity = (hexToNum(t.cardBorder) % 60) + 20;

      map[t.id] = ART_CanvasHash({
        profileId: t.id,
        username: t.name,
        trackTitle: t.textColor,
        lyrics: t.id + t.cardBg,
        mastering: { saturation: sat, clarity },
      }, 300, 140);
    });
    return map;
  }, [themes]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {themes.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={cn(
            'h-28 rounded-2xl border-2 transition-all relative overflow-hidden group cursor-pointer shadow-sm',
            currentThemeId === t.id ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg' : 'border-white/5 hover:border-white/20'
          )}>
          <img src={canvasBgs[t.id]} alt={t.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black to-transparent">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text)]">{t.name}</span>
          </div>
          {currentThemeId === t.id && (
             <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-3 h-3 text-[var(--color-text)]" />
             </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default function LinkVault() {
  useSEO('Artist Link-in-Bio', 'Build a professional dual-page artist bio with a live phone mockup and integrated studio feeds.');
  const { profile, updateProfile, shareableItems, addShareableItem, updateShareableItem, removeShareableItem, reorderShareableItems } = useProfile();
  const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'profile'>('links');
  const [themeCat, setThemeCat] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'links' | 'studio'>('links');
  const [copied, setCopied] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const links = shareableItems.filter(i => i.type === 'external_link').sort((a, b) => a.sortOrder - b.sortOrder);
  const contents = shareableItems.filter(i => i.type !== 'external_link').sort((a, b) => a.sortOrder - b.sortOrder);
  const currentTheme = Object.values(THEMES).flat().find(t => t.id === profile.theme) || THEMES.obsidian[0];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await resizeImageToBase64(file, 256);
        updateProfile({ avatarUrl: base64 });
      } catch (err) {
        console.error("Failed to process avatar:", err);
      }
    }
  };

  const getPlatformIcon = (url: string = '', fallbackClass = 'w-5 h-5') => {
    const lg = url.toLowerCase();
    if (lg.includes('spotify')) return <Spotify className={`${fallbackClass} text-[#1DB954]`} />;
    if (lg.includes('apple')) return <AppleMusic className={`${fallbackClass} text-[#FC3C44]`} />;
    if (lg.includes('soundcloud')) return <SoundCloud className={`${fallbackClass} text-[#FF5500]`} />;
    if (lg.includes('instagram')) return <Instagram className={`${fallbackClass} text-[#E4405F]`} />;
    if (lg.includes('youtube')) return <Youtube className={`${fallbackClass} text-[#FF0000]`} />;
    if (lg.includes('shop') || lg.includes('store')) return <ShoppingCart className={`${fallbackClass} text-amber-400`} />;
    return <GlobeIcon className={fallbackClass} />;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://vektrstudio.art/${profile.slug || 'identity'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-hidden h-full flex flex-col bg-[var(--color-bg-panel)] text-[var(--color-text)]">
      {/* Search/Filter Bar - Top Ambient */}
      <div className="h-14 border-b border-[var(--color-border-md)] bg-[var(--color-bg-panel)] flex items-center justify-between px-8 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Artist Node
          </div>
          <div className="h-4 w-px bg-[var(--color-border-md)]" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)]">
            SECURE_SEED: {profile.ownerId?.slice(0, 8)}...
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
             Sync_Active
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative z-10">
        
        {/* LEFT RAIL: EDITOR */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
          
          <header className="p-8 lg:p-12 shrink-0 border-b border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-500">
                   Artist Architecture
                </div>
                <h1 className="text-4xl font-semibold tracking-tight uppercase italic text-[var(--color-text)]">
                  Link Vault
                </h1>
              </div>
              <div className="flex gap-3">
                <button onClick={copyLink} className="flex items-center gap-3 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md bg-white text-black hover:bg-zinc-200">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Profile URL'}
                </button>
              </div>
            </div>
          </header>

          <div className="flex p-4 shrink-0 border-b border-white/5 bg-white/[0.02]">
             <div className="flex p-1 rounded-xl border border-[var(--color-border-md)] bg-[var(--color-bg-panel)] w-full max-w-md shadow-sm">
              {[
                { id: 'links', label: 'Links', icon: List },
                { id: 'appearance', label: 'Design', icon: Palette },
                { id: 'profile', label: 'Identity', icon: User }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-white text-black shadow-lg"
                      : "text-[var(--color-text)] hover:text-[var(--color-text)]"
                  )}>
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'links' && (
                <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 lg:p-12 space-y-12 mb-20">
                  
                  {/* Quick Add Socials */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 block">Quick Injection</label>
                    <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
                      {SOCIAL_PLATFORMS.map(platform => (
                        <button key={platform.id} 
                          onClick={() => addShareableItem({ 
                            type: 'external_link', title: platform.name, 
                            url: platform.id === 'generic' ? '' : platform.placeholder,
                            isVisible: true, sortOrder: shareableItems.length
                          })}
                          className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border transition-all shrink-0 w-20 group shadow-sm bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10")}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center border group-hover:scale-105 transition-transform shadow-inner bg-[var(--color-bg-panel)]/40 border-white/5">
                             <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Links List */}
                  <div className="space-y-6">
                     <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 block">Active Content Stack</label>
                     <div className="space-y-3">
                        {[...shareableItems].sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx) => (
                          <div key={item.id}
                            draggable
                            onDragStart={(e) => { setDragIndex(idx); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragEnd={() => { setDragIndex(null); setHoverIndex(null); }}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setHoverIndex(idx); }}
                            onDragLeave={() => setHoverIndex(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragIndex === null || dragIndex === idx) { setDragIndex(null); setHoverIndex(null); return; }
                              const sorted = [...shareableItems].sort((a, b) => a.sortOrder - b.sortOrder);
                              const [moved] = sorted.splice(dragIndex, 1);
                              sorted.splice(idx, 0, moved);
                              reorderShareableItems(sorted);
                              setDragIndex(null); setHoverIndex(null);
                            }}
                            className={cn(
                              "group p-4 border rounded-2xl flex items-center gap-5 shadow-sm transition-all",
                              dragIndex === idx ? "opacity-40 scale-[0.98]" : "",
                              hoverIndex === idx && dragIndex !== idx ? "border-blue-500/50 bg-blue-500/5" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                            )}>
                            <div className="cursor-grab active:cursor-grabbing text-[var(--color-text)] hover:text-[var(--color-text)]"><GripVertical className="w-4 h-4" /></div>
                            
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden shadow-sm bg-[var(--color-bg-panel)] border-[var(--color-border-md)]">
                              {item.type === 'external_link' ? getPlatformIcon(item.url || '', "w-5 h-5") : <Zap className="w-5 h-5 text-blue-500" />}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <input value={item.title} onChange={e => updateShareableItem(item.id, { title: e.target.value })} 
                                className="w-full bg-transparent font-bold text-sm outline-none uppercase tracking-tight text-[var(--color-text)] placeholder:text-[var(--color-text)]" placeholder="Label" />
                              <div className="flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                                 <Link2 className="w-3 h-3 text-[var(--color-text)]" />
                                 <input value={item.url || item.subtitle || ''} onChange={e => updateShareableItem(item.id, { url: e.target.value, subtitle: e.target.value })} 
                                   className="w-full bg-transparent text-[10px] font-mono outline-none truncate text-[var(--color-text)]" placeholder="endpoint_identifier" />
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <button onClick={() => updateShareableItem(item.id, { isVisible: !item.isVisible })}
                                className={cn("w-9 h-5 rounded-full relative transition-all shadow-inner", 
                                  item.isVisible ? "bg-blue-600" : "bg-white/5")}>
                                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm", item.isVisible ? "right-1" : "left-1")} />
                              </button>
                              <button onClick={() => removeShareableItem(item.id)} className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 text-[var(--color-text)] hover:text-red-400 bg-white/5 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {shareableItems.length === 0 && (
                          <div className="py-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center opacity-30">
                            <Link2 className="w-8 h-8 mb-4 text-[var(--color-text)]" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text)]">Vault Vacant - Inject Links</p>
                          </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 space-y-12">
                  
                  {/* Theme Category Switcher */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 px-2">Professional Theme Framework</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {THEME_CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setThemeCat(cat.id)}
                          className={cn(
                            "py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all cursor-pointer shadow-sm",
                            themeCat === cat.id 
                              ? "bg-white text-black border-white shadow-xl scale-105"
                              : "bg-white/5 border-white/10 text-[var(--color-text)] hover:text-[var(--color-text)]"
                          )}>
                          {cat.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    {themeCat && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-8 border border-white/10 bg-[var(--color-bg-panel)]/40 rounded-[2.5rem] space-y-6 shadow-xl">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--color-text)]">{THEME_CATEGORIES.find(c => c.id === themeCat)?.description}</p>
                          <button onClick={() => setThemeCat(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[var(--color-text)]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <ThemeSwatchGrid themes={THEMES[themeCat] || []} currentThemeId={profile.theme} onSelect={(id) => updateProfile({ theme: id })} />
                      </motion.div>
                    )}
                  </div>

                  {/* Card Styles */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 px-2">Visual Card Architecture</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {CARD_STYLES.map(style => (
                        <button key={style.id} onClick={() => updateProfile({ cardStyle: style.id })}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 transition-all text-left group flex flex-col gap-3 relative overflow-hidden cursor-pointer shadow-sm",
                            profile.cardStyle === style.id 
                               ? "bg-white border-white shadow-2xl scale-[1.02]"
                              : "bg-white/5 border-white/10 hover:border-white/30"
                          )}>
                          <div className={cn("w-full h-10 rounded-xl mb-1 transition-all", 
                            profile.cardStyle === style.id 
                              ? "bg-[var(--color-bg-panel)]/10"
                              : "bg-white/10",
                            style.id === 'glass' ? "backdrop-blur-md" : 
                            style.id === 'outline' ? "border-2 border-current bg-transparent" : 
                            style.id === 'brutalist' ? "shadow-[4px_4px_0px_currentColor]" : ""
                          )} />
                          <div className="space-y-1 relative z-10">
                            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", profile.cardStyle === style.id ? "text-black" : "text-[var(--color-text)]")}>{style.name}</span>
                            <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40 block", profile.cardStyle === style.id ? "text-black" : "text-[var(--color-text)]")}>{style.desc}</span>
                          </div>
                          {profile.cardStyle === style.id && (
                             <div className="absolute top-4 right-4 text-black"><CheckCircle2 className="w-5 h-5" /></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fonts Switcher */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 px-2">Global UI Typography</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {FONTS.map(f => (
                        <button key={f.id} onClick={() => updateProfile({ font: f.id })}
                          className={cn(
                            "px-8 py-5 rounded-2xl border transition-all text-[11px] font-bold tracking-tight cursor-pointer shadow-sm",
                            profile.font === f.id 
                               ? "bg-white text-black border-white shadow-2xl scale-105"
                              : "bg-white/5 border-white/10 text-[var(--color-text)] hover:text-[var(--color-text)]"
                          )} style={{ fontFamily: f.family }}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 space-y-12">
                  
                  {/* Identity Assets */}
                  <div className="flex flex-col md:flex-row items-center gap-10 p-10 border border-white/10 bg-[var(--color-bg-panel)]/40 rounded-[3rem] shadow-2xl group">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="relative z-10 p-2 bg-gradient-to-tr from-white/10 to-transparent rounded-full shadow-2xl">
                         <img src={profile.avatarUrl} alt="Identity" className="w-40 h-40 rounded-full object-cover border-4 border-white active:scale-95 transition-transform shadow-xl" />
                         <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 p-4 rounded-[1.5rem] shadow-2xl hover:scale-110 active:scale-90 transition-all cursor-pointer bg-white text-black">
                           <Upload className="w-5 h-5" />
                           <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                         </button>
                      </div>
                    </div>
                    <div className="space-y-6 text-center md:text-left flex-1">
                       <h3 className="text-3xl font-black italic tracking-tighter text-[var(--color-text)]">Artist Identity</h3>
                       <p className="text-[11px] uppercase font-bold tracking-[0.25em] max-w-sm leading-relaxed opacity-40 text-[var(--color-text)]">Your artist likeness and manifesto are cryptographically anchored to every asset you publish.</p>
                       <div className="flex gap-3 justify-center md:justify-start pt-2">
                         <button className="flex items-center gap-2 px-6 py-3 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all border shadow-lg cursor-pointer bg-white/5 text-[var(--color-text)] border-white/10 hover:bg-white/15">
                           <ImageIcon className="w-3.5 h-3.5" /> Identity Log
                         </button>
                         <button className="flex items-center gap-2 px-6 py-3 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all border shadow-lg cursor-pointer bg-white/5 text-[var(--color-text)] border-white/10 hover:bg-white/15">
                           <Shield className="w-3.5 h-3.5" /> ID Protocol
                         </button>
                       </div>
                    </div>
                  </div>

                  {/* Metadata Editor */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 px-2">Primary Artist ID</label>
                      <input value={profile.displayName} onChange={e => updateProfile({ displayName: e.target.value })} 
                        className="w-full border border-[var(--color-border-md)] bg-[var(--color-bg-panel)] text-[var(--color-text)] focus:border-[var(--color-border)] rounded-[1.5rem] py-5 px-8 text-xl font-bold outline-none shadow-sm placeholder:text-[var(--color-text-muted)]" placeholder="Artist Name" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 px-2">Vault Identifier (URL Slug)</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-8 font-mono text-xs text-[var(--color-text-muted)]">vektrstudio.art/</span>
                        <input value={profile.slug} onChange={e => updateProfile({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                          className="w-full border border-[var(--color-border-md)] bg-[var(--color-bg-panel)] text-[var(--color-text)] focus:border-[var(--color-border)] rounded-[1.5rem] py-5 px-8 pl-[6.5rem] text-sm font-bold outline-none font-mono shadow-sm placeholder:text-[var(--color-text-muted)]" placeholder="slug" />
                      </div>
                    </div>
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 px-2">Identity Manifesto (Biography)</label>
                      <textarea rows={5} value={profile.bio} onChange={e => updateProfile({ bio: e.target.value })} 
                        className="w-full border border-[var(--color-border-md)] bg-[var(--color-bg-panel)] text-[var(--color-text)] focus:border-[var(--color-border)] rounded-[2rem] py-6 px-8 text-base font-medium outline-none resize-none leading-relaxed shadow-sm placeholder:text-[var(--color-text-muted)]" placeholder="Tell your story..." />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MONITOR PANEL: LIVE PREVIEW */}
        <div className="hidden lg:flex w-full lg:w-[480px] xl:w-[560px] flex-col items-center justify-center overflow-hidden sticky top-0 h-full bg-white/[0.01]">
          <div className="w-[340px] h-[680px] bg-[#0c0c0e] rounded-[3.5rem] p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] border-[8px] border-zinc-800 relative z-20 overflow-hidden ring-1 ring-white/5">
            
            {/* Phone Screen Root */}
            <div className={cn('w-full h-full rounded-[2.8rem] relative overflow-hidden flex flex-col transition-colors duration-1000', currentTheme.bgClass)} style={{ ...currentTheme.customStyle, fontFamily: FONTS.find(f => f.id === profile.font)?.family || 'inherit' }}>
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-3 w-24 h-6 bg-[var(--color-bg-panel)] rounded-full z-[100] border border-white/5 shrink-0" />
              
              <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pb-20 pt-16 px-6">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center space-y-5 mb-8">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative w-24 h-24 rounded-full p-1 border border-white/10 bg-[var(--color-bg-panel)]/20 backdrop-blur-xl">
                    <img src={profile.avatarUrl} alt="Identity" className="w-full h-full rounded-full object-cover" />
                  </motion.div>
                  
                  <div className="space-y-1.5 px-2">
                    <h2 className="text-xl font-black tracking-tight" style={{ color: currentTheme.textColor }}>{profile.displayName || 'IDENTITY'}</h2>
                    <p className="text-[10px] font-medium leading-relaxed opacity-60" style={{ color: currentTheme.textColor }}>{profile.bio || 'Independent sonic architect.'}</p>
                  </div>

                  <div className="flex p-1 bg-[var(--color-bg-panel)]/40 backdrop-blur-xl rounded-xl border border-white/10 w-full max-w-[180px]">
                    <button onClick={() => setPreviewTab('links')}
                      className={cn("flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all", previewTab === 'links' ? "bg-white text-black shadow-lg" : "text-[var(--color-text)]")}>Links</button>
                    <button onClick={() => setPreviewTab('studio')}
                      className={cn("flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all", previewTab === 'studio' ? "bg-white text-black shadow-lg" : "text-[var(--color-text)]")}>Studio</button>
                  </div>
                </div>

                {/* Stacks */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {(previewTab === 'links' ? links : contents).filter(l => l.isVisible).map((link, i) => (
                      <motion.div 
                        key={link.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}
                        className={cn(
                          "w-full h-14 relative flex items-center px-6 transition-all duration-300 overflow-hidden",
                          profile.cardStyle === 'solid' ? "rounded-xl border-none" : 
                          profile.cardStyle === 'brutalist' ? "rounded-none border-2" : 
                          profile.cardStyle === 'outline' ? "rounded-xl border-2 bg-transparent" : 
                          "rounded-xl backdrop-blur-3xl shadow-lg border border-white/5" // glass
                        )}
                        style={{ 
                          background: profile.cardStyle === 'outline' ? 'transparent' : currentTheme.cardBg, 
                          borderColor: profile.cardStyle === 'brutalist' || profile.cardStyle === 'outline' ? currentTheme.textColor : currentTheme.cardBorder,
                          color: currentTheme.textColor,
                          ...(profile.cardStyle === 'brutalist' ? { boxShadow: `4px 4px 0px ${currentTheme.textColor}` } : {}),
                          ...currentTheme.customStyle
                        }}>
                        {previewTab === 'links' ? getPlatformIcon(link.url || '', "w-4 h-4 absolute left-5") : <Music className="w-4 h-4 absolute left-5" />}
                        <div className="flex-1 text-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate block px-10">{link.title || 'NEW STACK'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-30">
                 <div className="flex items-center gap-1.5" style={{ color: currentTheme.textColor }}>
                    <Zap className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">VEKTR</span>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

