/**
 * Floating Metronome Popup
 * 
 * Draggable, always-on-top metronome overlay for Mobile Studio.
 * Uses Web Audio API for sample-accurate timing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Square, GripVertical } from '../lib/icons';
import { cn } from '../lib/utils';
import { useMetronomeWorker } from '../lib/hooks/useMetronomeWorker';
import { motion, useDragControls } from 'motion/react';

interface MetronomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MetronomePopup({ isOpen, onClose }: MetronomePopupProps) {
  const [bpm, setBpm] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [beat, setBeat] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  
  const dragControls = useDragControls();

  // Use the worker-based metronome for drift-free timing
  useMetronomeWorker(bpm, isActive, (currentBeat) => setBeat(currentBeat));

  if (!isOpen) return null;

  const presets = [60, 80, 100, 120, 140, 160, 180];

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: position.x, y: position.y }}
      onDragEnd={(_, info) => {
        setPosition({ x: info.point.x, y: info.point.y });
      }}
      className="fixed z-[9999] select-none"
      style={{
        touchAction: 'none',
      }}
    >
      <div className="bg-[var(--color-bg-panel)] border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden min-w-[280px]">
        {/* Header - Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 cursor-move"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-[var(--color-text)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
              Metronome
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* BPM Display */}
          <div className="text-center">
            <div className="text-6xl font-black tracking-tighter text-white mb-1">
              {bpm}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text)]">
              BPM
            </div>
          </div>

          {/* Beat Indicator */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-100',
                  beat % 4 === i
                    ? 'bg-amber-500 scale-125 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                    : 'bg-white/10'
                )}
              />
            ))}
          </div>

          {/* BPM Slider */}
          <div className="space-y-3">
            <input
              type="range"
              min={40}
              max={240}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            
            {/* Preset Buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBpm(preset)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all',
                    bpm === preset
                      ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                      : 'border-white/10 text-[var(--color-text)] hover:border-white/30'
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Play/Stop Button */}
          <button
            onClick={() => setIsActive(!isActive)}
            className={cn(
              'w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2',
              isActive
                ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-white text-black hover:bg-white/90'
            )}
          >
            {isActive ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
