import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from '../lib/router';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { useSEO } from '../lib/useSEO';
import { injectWavMetadata } from '../lib/wavMetadata';
import type { MediaItem } from '../types';

// Modular Components
import { LibrarySidebar, type LibraryCategory } from '../components/Library/LibrarySidebar';
import { LibraryHeader } from '../components/Library/LibraryHeader';
import { AssetCard } from '../components/Library/AssetCard';
import { AssetInspector } from '../components/Library/AssetInspector';

// Native Zero-Dependency WAV Encoder (16-bit PCM)
function encodeAudioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result;
  if (numChannels === 2) {
    const channel0 = buffer.getChannelData(0);
    const channel1 = buffer.getChannelData(1);
    result = new Float32Array(channel0.length * 2);
    for (let i = 0; i < channel0.length; i++) {
      result[i * 2] = channel0[i];
      result[i * 2 + 1] = channel1[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const dataLength = result.length * (bitDepth / 8);
  const bufferArray = new ArrayBuffer(44 + dataLength);
  const view = new DataView(bufferArray);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function ContentLibrary() {
  const navigate = useNavigate();
  const { profile, vault, uploadMedia, updateMedia, addMedia, deleteMedia, activeMediaId, setActiveMediaId, shareableItems, addShareableItem, isPlaying, togglePlay } = useProfile();

  const FOCUS_ROUTES = ['/visualizer', '/vektr-lab', '/tuner', '/sampler', '/mobile', '/lyrics'];
  
  const [filter, setFilter] = useState<LibraryCategory>('All');
  const [stemFilter, setStemFilter] = useState('All Stems');
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metadata' | 'media' | 'converter' | 'builder'>('metadata');
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingItem = vault.find(t => t.id === editingItemId) || null;

  // Filtering Logic
  const filteredVault = useMemo(() => {
    let result = filter === 'All' ? vault : vault.filter(t => t.category === filter);
    if (filter === 'Stems' && stemFilter !== 'All Stems') {
      result = result.filter(t => (t as any).subcategory === stemFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.artist.toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [vault, filter, stemFilter, search]);

  const sectionMeta = {
    parent: ['Single', 'EP', 'Album'].includes(filter) ? 'Repertoire' 
          : filter === 'Stems' ? 'Studio Assets' 
          : filter === 'All' ? 'Files' : 'Media',
  };

  // Media Info Analysis
  useEffect(() => {
    if (!editingItem?.fileUrl || activeTab !== 'media' || editingItem.type !== 'audio') return;
    
    setMediaInfo(null);
    const analyze = async () => {
      try {
        const res = await fetch(editingItem.fileUrl!);
        const arrayBuffer = await res.arrayBuffer();
        const offlineCtx = new window.OfflineAudioContext(2, 44100, 44100);
        const buffer = await offlineCtx.decodeAudioData(arrayBuffer);
        
        const channelData = buffer.getChannelData(0);
        let maxPeak = 0;
        // SAMPLE-ACCURATE PEAK DETECTION
        for(let i=0; i<channelData.length; i++) {
          const abs = Math.abs(channelData[i]);
          if(abs > maxPeak) maxPeak = abs;
        }
        
        const peakDb = maxPeak > 0 ? (20 * Math.log10(maxPeak)).toFixed(2) : '-inf';
        const mins = Math.floor(buffer.duration / 60);
        const secs = Math.floor(buffer.duration % 60);

        setMediaInfo({
          duration: `${mins}:${secs.toString().padStart(2, '0')}`,
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
          format: res.headers.get('content-type')?.split(';')[0] || 'audio/wav',
          peak: `${peakDb} dBFS`
        });
      } catch(e) { console.error(e); }
    };
    analyze();
  }, [editingItem?.fileUrl, activeTab]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      alert('Unsupported file type.');
      return;
    }
    setIsUploading(true);
    try {
      const targetCategory = filter !== 'All' ? filter as MediaItem['category'] : undefined;
      // uploadMedia now triggers IngestEngine automatically in the background
      await uploadMedia(file, targetCategory);
    } catch (err) { console.error(err); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleCreateCollection = () => {
    const newId = addMedia({
      title: 'New ' + (filter === 'EP' ? 'EP' : 'Album'),
      artist: profile.displayName || 'Creator',
      type: 'collection',
      category: filter as 'EP' | 'Album',
      duration: 0,
      trackIds: []
    });
    setEditingItemId(newId);
    setActiveTab('builder');
  };

  const handleExportWAV = async () => {
    if (!editingItem?.fileUrl) return;
    setIsConverting(true);
    try {
      const res = await fetch(editingItem.fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const offlineCtx = new window.OfflineAudioContext(2, 44100, 44100);
      const buffer = await offlineCtx.decodeAudioData(arrayBuffer);
      const wavBlob = encodeAudioBufferToWav(buffer);
      
      const enhancedBlob = await injectWavMetadata(wavBlob, {
        title: editingItem.title,
        artist: editingItem.artist,
        software: 'VEKTR Studio - Export',
        date: new Date().toISOString().split('T')[0]
      });

      const url = URL.createObjectURL(enhancedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${editingItem.title || 'Export'}_Studio.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error("Export error:", e); }
    setIsConverting(false);
  };

  const handleAddVault = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    addShareableItem({ 
      type: item.type === 'audio' ? 'track' : item.type === 'video' ? 'visual' : 'external_link', 
      title: item.title, 
      subtitle: item.category ? `${item.category} - ${item.artist}` : item.artist,
      thumbnail: item.thumbnailUrl, 
      sourceId: item.id, 
      isVisible: true, 
      sortOrder: 0 
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-[24px] w-full h-full pb-[48px]">
      <input type="file" ref={fileInputRef} accept="audio/*,video/*,image/*" className="hidden" onChange={handleFileChange} />

      <LibrarySidebar 
        activeCategory={filter}
        onCategoryChange={setFilter}
        activeSubCategory={stemFilter}
        onSubCategoryChange={setStemFilter}
      />

      <main className="min-w-0 flex flex-col gap-[24px]">
        <LibraryHeader 
          category={filter}
          parent={sectionMeta.parent}
          count={filteredVault.length}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isUploading={isUploading}
          onUploadClick={handleUploadClick}
          onCreateCollection={handleCreateCollection}
        />

        {filteredVault.length === 0 ? (
          <div className="ui-panel flex flex-col items-center justify-center py-24">
            <p className="text-micro text-[var(--color-text)]">No Files Found</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-[16px]",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {filteredVault.map((item) => (
              <AssetCard 
                key={item.id}
                item={item}
                isActive={activeMediaId === item.id}
                isPlaying={isPlaying}
                isShared={shareableItems.some(i => i.sourceId === item.id)}
                onPlayClick={(e) => { 
                  e.stopPropagation(); 
                  if (activeMediaId === item.id) togglePlay(); 
                  else setActiveMediaId(item.id); 
                }}
                onAddClick={(e) => handleAddVault(e, item)}
                onEditClick={() => { setEditingItemId(item.id); setActiveTab('metadata'); }}
              />
            ))}
          </div>
        )}
      </main>

      <AssetInspector 
        item={editingItem}
        onClose={() => setEditingItemId(null)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUpdateMetadata={(key, val) => editingItemId && updateMedia(editingItemId, { [key]: val })}
        onDelete={(id) => { deleteMedia(id); setEditingItemId(null); }}
        mediaInfo={mediaInfo}
        isConverting={isConverting}
        onExportWAV={handleExportWAV}
      />
    </div>
  );
}

