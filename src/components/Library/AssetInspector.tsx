import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Upload, Music2, Video, Image as ImageIcon, Disc, 
  LayoutTemplate, LayoutGrid, Activity, FileAudio, Download, Settings2, Trash2
} from '../../lib/icons';
import { cn } from '../../lib/utils';
import type { MediaItem } from '../../types';

interface AssetInspectorProps {
  item: MediaItem | null;
  onClose: () => void;
  activeTab: 'metadata' | 'media' | 'converter' | 'builder';
  onTabChange: (tab: 'metadata' | 'media' | 'converter' | 'builder') => void;
  onUpdateMetadata: (key: string, value: string) => void;
  onDelete: (id: string) => void;
  mediaInfo: any;
  isConverting: boolean;
  onExportWAV: () => void;
}

const CATEGORIES = ['Single', 'EP', 'Album', 'Stems', 'Videos', 'Photos'];
const STEM_CATEGORIES = [
  'Instrumental', 'Vocals', 'Backing Vocals', 'Drums', 'Percussion', 
  'Bass', 'Guitar', 'Synth', 'Keys', 'Piano', 'Strings', 'Brass', 'Woodwinds', 'FX', 'Others'
];

export function AssetInspector({
  item,
  onClose,
  activeTab,
  onTabChange,
  onUpdateMetadata,
  onDelete,
  mediaInfo,
  isConverting,
  onExportWAV
}: AssetInspectorProps) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-bg)]/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 20 }} 
          className="ui-panel flex flex-col md:flex-row p-0 max-w-[1000px] w-full max-h-[85vh] overflow-hidden"
        >
          {/* Left Column: Preview & ID */}
          <div className="w-full md:w-[340px] p-[32px] border-r border-white/[0.06] flex flex-col items-center relative shrink-0 bg-[#0a0c12]">
            <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-[8px] border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-[var(--color-text)] md:hidden z-20 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="w-full aspect-square rounded-[12px] border border-white/[0.06] bg-white/[0.02] mb-[24px] relative group overflow-hidden flex flex-col items-center justify-center">
              {item.type === 'video' ? (
                <video src={item.fileUrl} controls className="absolute inset-0 w-full h-full object-contain bg-black z-10" />
              ) : item.type === 'image' ? (
                <img src={item.fileUrl || item.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover z-10" />
              ) : (
                <>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity z-10" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-[var(--color-text)] z-10" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                    <div className="p-3 bg-white/10 backdrop-blur rounded-[8px] border border-white/[0.1] flex flex-col items-center text-[var(--color-text)]">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-micro">Update Cover</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <h2 className="text-section-title text-center mb-[8px] line-clamp-2 w-full">{item.title}</h2>
            <p className="text-app-label text-center mb-[24px] truncate w-full">{item.artist}</p>
            
            {item.type === 'audio' && (
              <audio src={item.fileUrl} controls className="w-full h-8 mb-[24px] outline-none opacity-80 mix-blend-screen" />
            )}

            <div className="mt-auto pt-4 border-t border-white/[0.06] w-full text-center">
              <div className="flex items-center justify-center gap-[8px] text-micro opacity-60">
                <Settings2 className="w-4 h-4" /> File ID: {item.id.split('-')[1]}
              </div>
            </div>
          </div>

          {/* Right Column: Tools */}
          <div className="flex-1 flex flex-col bg-[var(--color-bg-panel)]">
            <header className="flex items-center justify-between px-[32px] py-[16px] border-b border-white/[0.06]">
              <div className="flex gap-[24px]">
                {[
                  { id: 'metadata', label: 'ID3 Tags', icon: LayoutTemplate, hidden: item.type === 'collection' },
                  { id: 'builder', label: 'Tracklist', icon: LayoutGrid, hidden: item.type !== 'collection' },
                  { id: 'media', label: 'File Info', icon: Activity, hidden: item.type === 'collection' },
                  { id: 'converter', label: 'Export', icon: FileAudio, hidden: item.type === 'collection' }
                ].filter(t => !t.hidden).map(t => (
                  <button key={t.id} onClick={() => onTabChange(t.id as any)}
                    className={cn(
                      "flex flex-col items-center gap-[6px] transition-all cursor-pointer relative py-2", 
                      activeTab === t.id ? "text-[var(--color-text)]" : "text-[var(--color-text)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-micro">{t.label}</span>
                    {activeTab === t.id && (
                      <motion.div layoutId="activetab" className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#7ca2ff]" />
                    )}
                  </button>
                ))}
              </div>
              <button onClick={onClose} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-white/[0.05] hover:bg-white/[0.1] text-[var(--color-text)] border border-white/[0.06] transition-colors hidden md:flex">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 p-[32px] overflow-y-auto">
              {activeTab === 'metadata' && (
                <div className="space-y-[24px]">
                  <div className="space-y-[8px]">
                    <label className="text-app-label">Title</label>
                    <input value={item.title} onChange={e => onUpdateMetadata('title', e.target.value)} className="ui-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-[16px]">
                    <div className="space-y-[8px]">
                      <label className="text-app-label">Artist</label>
                      <input value={item.artist} onChange={e => onUpdateMetadata('artist', e.target.value)} className="ui-input" />
                    </div>
                    <div className="space-y-[8px]">
                      <label className="text-app-label">Category</label>
                      <select value={item.category || ''} onChange={e => onUpdateMetadata('category', e.target.value)} className="ui-input cursor-pointer appearance-none">
                        {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[var(--color-bg-panel)]">{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {item.category === 'Stems' && (
                    <div className="space-y-[8px]">
                      <label className="text-app-label">Stem Type</label>
                      <select value={(item as any).subcategory || ''} onChange={e => onUpdateMetadata('subcategory' as any, e.target.value)} className="ui-input cursor-pointer appearance-none">
                        {STEM_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[var(--color-bg-panel)]">{cat}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="pt-[24px] mt-[32px] border-t border-red-500/10">
                    <button onClick={() => onDelete(item.id)} className="w-full h-[48px] rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 font-semibold tracking-wide hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Trash2 className="w-4 h-4" /> Delete File Permanently
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-[24px]">
                  <div className="ui-card flex flex-col gap-[24px]">
                    <h3 className="text-section-title flex items-center gap-[12px]">
                      <Activity className="w-5 h-5 text-[#7ca2ff]" /> Decoder Insights
                    </h3>
                    
                    {!mediaInfo ? (
                      <div className="text-center py-8 text-[var(--color-text)] text-micro">Extracting Data...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-y-[24px] gap-x-[16px]">
                        <InfoItem label="MIME Format" value={mediaInfo.format} />
                        <InfoItem label="Duration" value={mediaInfo.duration} />
                        <InfoItem label="Sample Rate" value={`${mediaInfo.sampleRate} Hz`} />
                        <InfoItem label="Channels" value={mediaInfo.channels === 2 ? 'Stereo (2)' : 'Mono (1)'} />
                        <div className="col-span-2 pt-[16px] border-t border-white/[0.06]">
                          <InfoItem label="Peak Amplitude" value={mediaInfo.peak} highlight />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'converter' && (
                <div className="space-y-[24px]">
                  <div className="ui-card">
                    <h3 className="text-section-title mb-[12px]">High-Quality Export</h3>
                    <p className="text-body mb-[24px]">
                      Download in standard high-quality WAV format, ready for distribution to streaming platforms.
                    </p>

                    <button 
                      onClick={onExportWAV} 
                      disabled={isConverting || item.type !== 'audio'}
                      className="ui-button w-full h-[56px] disabled:opacity-50"
                    >
                      <Download className="w-5 h-5" /> 
                      {isConverting ? 'Preparing Data...' : 'Download WAV Master'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-app-label text-[var(--color-text)]">{label}</p>
      <p className={cn("text-[15px] font-semibold tracking-wide", highlight ? "text-[#7ca2ff]" : "text-[var(--color-text)]")}>
        {value}
      </p>
    </div>
  );
}
