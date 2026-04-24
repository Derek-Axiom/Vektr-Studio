import React from 'react';
import { Music2, Play, Pause, Video, Image as ImageIcon, Plus, CheckCircle2, Disc } from '../../lib/icons';
import { cn } from '../../lib/utils';
import type { MediaItem } from '../../types';

interface AssetCardProps {
  item: MediaItem;
  isActive: boolean;
  isPlaying: boolean;
  isShared: boolean;
  onPlayClick: (e: React.MouseEvent) => void;
  onAddClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
}

export function AssetCard({
  item,
  isActive,
  isPlaying,
  isShared,
  onPlayClick,
  onAddClick,
  onEditClick,
}: AssetCardProps) {
  const isAudio = item.type === 'audio';

  return (
    <button
      onClick={onEditClick}
      className={cn(
        "ui-card group flex w-full flex-col text-left select-none",
        isActive && "border-white/20 bg-white/[0.04]"
      )}
    >
      <div className="mb-[16px] flex items-start justify-between gap-[12px] w-full relative z-10">
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-white/[0.04] border border-white/[0.06] shrink-0 overflow-hidden relative">
          {item.thumbnailUrl ? (
            <img 
              src={item.thumbnailUrl} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"
              referrerPolicy="no-referrer" 
            />
          ) : isAudio ? (
            <Music2 className="w-4 h-4 text-[var(--color-text)]" />
          ) : item.type === 'video' ? (
            <Video className="w-4 h-4 text-[var(--color-text)]" />
          ) : item.type === 'image' ? (
            <ImageIcon className="w-4 h-4 text-[var(--color-text)]" />
          ) : (
            <Disc className="w-4 h-4 text-[var(--color-text)]" />
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-[6px]">
          {isActive && isAudio && (
            <span className="rounded-[4px] px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase bg-white text-black shadow-sm">
              LIVE
            </span>
          )}
          {isShared && (
            <span className="rounded-[4px] border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase flex items-center gap-[4px] bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-2 h-2" /> SHARED
            </span>
          )}
        </div>
      </div>

      <div className="space-y-[4px] relative z-10">
        <h3 className="line-clamp-1 text-card-title text-[var(--color-text)] pr-[24px]">
          {item.title}
        </h3>
        <p className="line-clamp-1 text-micro text-[var(--color-text)]">
          {item.subcategory || item.category || 'FILE'}
        </p>
      </div>

      <div className="mt-[16px] flex items-center gap-[8px] text-[11px] font-medium text-[var(--color-text)]">
        <span className="truncate">{item.artist}</span>
        {item.bpm && (
          <>
            <span className="opacity-20">-</span>
            <span>{item.bpm} BPM</span>
          </>
        )}
        {item.key && (
          <>
            <span className="opacity-20">-</span>
            <span>Key {item.key}</span>
          </>
        )}
      </div>

      {/* Hover Affordances */}
      <div className="absolute top-[16px] right-[16px] flex items-center gap-[8px] opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 z-20">
        {isAudio && (
          <button 
            onClick={onPlayClick}
            className="w-[32px] h-[32px] rounded-[8px] bg-white/[0.08] backdrop-blur border border-white/[0.1] text-[var(--color-text)] flex items-center justify-center hover:bg-white/[0.15] hover:border-white/[0.2] transition-all shadow-lg active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isActive && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        )}
        {!isShared && (
          <button 
            onClick={onAddClick}
            className="w-[32px] h-[32px] rounded-[8px] bg-white/[0.08] backdrop-blur border border-white/[0.1] text-[var(--color-text)] flex items-center justify-center hover:bg-white/[0.15] hover:border-white/[0.2] transition-all shadow-lg active:scale-95"
            title="Add to Content Vault"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </button>
  );
}

