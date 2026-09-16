import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Layers,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Sparkles,
  Download,
  Film,
  Sliders
} from 'lucide-react';
import { AnimationFrame, SampleAnimationPreset } from '../types';
import { ANIMATION_PRESETS } from '../utils/animationPresets';

interface AnimationTimelineProps {
  frames: AnimationFrame[];
  activeFrameIndex: number;
  isPlaying: boolean;
  fps: number;
  loop: boolean;
  onionSkin: boolean;
  onSelectFrame: (index: number) => void;
  onTogglePlay: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onChangeFps: (fps: number) => void;
  onToggleLoop: () => void;
  onToggleOnionSkin: () => void;
  onAddCurrentAsFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  onMoveFrame: (fromIndex: number, toIndex: number) => void;
  onUploadBatchImages: (files: FileList) => void;
  onLoadPreset: (preset: SampleAnimationPreset) => void;
  onApplySettingsToAll: () => void;
  onExportGif: (scale: number) => void;
  onExportSpritesheet: (scale: number, layout: 'horizontal' | 'grid') => void;
}

export const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  frames,
  activeFrameIndex,
  isPlaying,
  fps,
  loop,
  onionSkin,
  onSelectFrame,
  onTogglePlay,
  onStepPrev,
  onStepNext,
  onChangeFps,
  onToggleLoop,
  onToggleOnionSkin,
  onAddCurrentAsFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onMoveFrame,
  onUploadBatchImages,
  onLoadPreset,
  onApplySettingsToAll,
  onExportGif,
  onExportSpritesheet
}) => {
  const batchInputRef = useRef<HTMLInputElement>(null);
  const [showPresetsMenu, setShowPresetsMenu] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const msPerFrame = Math.round(1000 / fps);
  const FPS_PRESETS = [2, 4, 6, 8, 12, 16, 24];

  return (
    <div
      id="animation-timeline-dock"
      className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl backdrop-blur-md"
    >
      {/* Top Bar: Playback Controls, FPS Slider, Presets & Batch Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
        {/* Playback Transport Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="anim-step-prev-btn"
            type="button"
            onClick={onStepPrev}
            title="Previous Frame"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            id="anim-play-toggle-btn"
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Animation (Space)' : 'Play Animation (Space)'}
            className={`px-3.5 h-8 rounded-lg flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            id="anim-step-next-btn"
            type="button"
            onClick={onStepNext}
            title="Next Frame"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Loop toggle */}
          <button
            id="anim-loop-toggle-btn"
            type="button"
            onClick={onToggleLoop}
            title={loop ? 'Looping enabled' : 'Play once'}
            className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
              loop
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Loop</span>
          </button>

          {/* Onion Skinning toggle */}
          <button
            id="anim-onion-skin-btn"
            type="button"
            onClick={onToggleOnionSkin}
            title="Onion Skinning: Ghost overlay of previous frame"
            className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
              onionSkin
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Onion Skin</span>
          </button>
        </div>

        {/* FPS & Speed Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono">Rate:</span>
            <input
              id="anim-fps-slider"
              type="range"
              min="1"
              max="24"
              value={fps}
              onChange={(e) => onChangeFps(parseInt(e.target.value, 10))}
              className="w-20 sm:w-28 accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
            />
            <span className="text-xs font-mono font-bold text-emerald-400 min-w-[44px]">
              {fps} FPS
            </span>
            <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
              ({msPerFrame}ms)
            </span>
          </div>

          {/* Quick FPS Presets */}
          <div className="hidden lg:flex items-center gap-1">
            {FPS_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChangeFps(p)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                  fps === p
                    ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Animation Presets Dropdown */}
          <div className="relative">
            <button
              id="anim-presets-dropdown-btn"
              type="button"
              onClick={() => {
                setShowPresetsMenu(!showPresetsMenu);
                setShowExportMenu(false);
              }}
              className="h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-slate-700/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Presets</span>
            </button>

            {showPresetsMenu && (
              <div
                id="anim-presets-menu"
                className="absolute right-0 bottom-full mb-2 w-52 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1"
              >
                <div className="px-2 py-1 text-[11px] font-mono uppercase text-slate-400 font-semibold border-b border-slate-800">
                  Sample Animations
                </div>
                {ANIMATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onLoadPreset(preset);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-slate-800 flex items-center justify-between group cursor-pointer transition-colors"
                  >
                    <span className="text-slate-200 group-hover:text-emerald-300 font-medium">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.frames.length} frames
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Batch Images Upload */}
          <input
            ref={batchInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUploadBatchImages(e.target.files);
              }
            }}
          />
          <button
            id="anim-batch-upload-btn"
            type="button"
            onClick={() => batchInputRef.current?.click()}
            title="Upload multiple images as sequential frames"
            className="h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-slate-700/60 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Add Frames</span>
          </button>

          {/* Animation Export Menu */}
          <div className="relative">
            <button
              id="anim-export-dropdown-btn"
              type="button"
              onClick={() => {
                setShowExportMenu(!showExportMenu);
                setShowPresetsMenu(false);
              }}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20 transition-all"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Export GIF</span>
            </button>

            {showExportMenu && (
              <div
                id="anim-export-menu"
                className="absolute right-0 bottom-full mb-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1.5"
              >
                <div className="px-2 py-1 text-[11px] font-mono uppercase text-slate-400 font-semibold border-b border-slate-800">
                  Animation Export
                </div>

                <div className="px-2 text-[11px] text-slate-400">
                  Looping Animated GIF:
                </div>
                <div className="grid grid-cols-3 gap-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      onExportGif(1);
                      setShowExportMenu(false);
                    }}
                    className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-200 text-xs font-mono text-center cursor-pointer transition-colors"
                  >
                    1× Native
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportGif(4);
                      setShowExportMenu(false);
                    }}
                    className="px-2 py-1.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono text-center cursor-pointer hover:bg-emerald-500/30 transition-colors"
                  >
                    4× Crisp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportGif(8);
                      setShowExportMenu(false);
                    }}
                    className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-200 text-xs font-mono text-center cursor-pointer transition-colors"
                  >
                    8× HD
                  </button>
                </div>

                <div className="h-px bg-slate-800 my-1" />

                <div className="px-2 text-[11px] text-slate-400">
                  Game Dev Spritesheet (PNG):
                </div>
                <div className="grid grid-cols-2 gap-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      onExportSpritesheet(2, 'horizontal');
                      setShowExportMenu(false);
                    }}
                    className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono text-center cursor-pointer transition-colors"
                  >
                    Strip (Horizontal)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportSpritesheet(2, 'grid');
                      setShowExportMenu(false);
                    }}
                    className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono text-center cursor-pointer transition-colors"
                  >
                    Grid Layout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filmstrip Frame Sequence Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        {frames.map((frame, index) => {
          const isActive = index === activeFrameIndex;
          return (
            <div
              key={frame.id}
              id={`frame-card-${index}`}
              onClick={() => onSelectFrame(index)}
              className={`relative group flex-shrink-0 flex flex-col items-center rounded-xl p-1.5 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/70 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Frame Number Badge */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 mb-1">
                <span className={isActive ? 'text-emerald-400 font-bold' : ''}>
                  #{index + 1}
                </span>
                <span className="text-slate-500 truncate max-w-[50px]">
                  {frame.name}
                </span>
              </div>

              {/* Canvas Preview Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/80 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800/80 relative">
                <canvas
                  ref={(node) => {
                    if (node && frame.pixelCanvas) {
                      node.width = frame.pixelCanvas.width;
                      node.height = frame.pixelCanvas.height;
                      const ctx = node.getContext('2d');
                      if (ctx) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(frame.pixelCanvas, 0, 0);
                      }
                    }
                  }}
                  className="max-w-full max-h-full object-contain pixelated"
                />

                {isActive && isPlaying && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
                )}
              </div>

              {/* Frame Action Controls on Hover */}
              <div className="flex items-center gap-1 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Move Left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveFrame(index, index - 1);
                    }}
                    title="Move Frame Left"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                )}

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateFrame(index);
                  }}
                  title="Duplicate Frame"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                {frames.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFrame(index);
                    }}
                    title="Delete Frame"
                    className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                {/* Move Right */}
                {index < frames.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveFrame(index, index + 1);
                    }}
                    title="Move Frame Right"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Frame Button */}
        <button
          id="anim-add-frame-btn"
          type="button"
          onClick={onAddCurrentAsFrame}
          className="flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-emerald-950/20 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-emerald-300 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-center leading-tight">
            Add Frame
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            From Canvas
          </span>
        </button>
      </div>

      {/* Bottom status & sync bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {frames.length} {frames.length === 1 ? 'Frame' : 'Frames'} Sequenced
          </span>
          <span className="text-slate-600">•</span>
          <span>
            Total duration: {((frames.length * msPerFrame) / 1000).toFixed(2)}s
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onApplySettingsToAll}
            title="Applies current quality, palette, and dithering settings across all frames"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-300 cursor-pointer font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync Settings to All Frames</span>
          </button>
        </div>
      </div>
    </div>
  );
};
