import React, { useRef, useEffect } from 'react';
import {
  Monitor,
  ArrowDownLeft,
  ExternalLink,
  Sparkles,
  Layers,
  Film,
  Play,
  Pause,
  AppWindow
} from 'lucide-react';
import { DetachMode } from '../types';

interface DetachedPlaceholderProps {
  pixelCanvas: HTMLCanvasElement | null;
  quality: number;
  paletteName: string;
  frameCount: number;
  activeFrameIndex: number;
  fps: number;
  isPlaying: boolean;
  onReattach: () => void;
  onFocusWindow?: () => void;
  detachMode: DetachMode;
  onSwitchToFloating?: () => void;
  onSwitchToWindow?: () => void;
}

export const DetachedPlaceholder: React.FC<DetachedPlaceholderProps> = ({
  pixelCanvas,
  quality,
  paletteName,
  frameCount,
  activeFrameIndex,
  fps,
  isPlaying,
  onReattach,
  onFocusWindow,
  detachMode,
  onSwitchToFloating,
  onSwitchToWindow,
}) => {
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  // Live mini preview rendering
  useEffect(() => {
    if (!pixelCanvas || !miniCanvasRef.current) return;
    const canvas = miniCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = pixelCanvas.width;
    canvas.height = pixelCanvas.height;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0);
  }, [pixelCanvas]);

  const width = pixelCanvas?.width || quality;
  const height = pixelCanvas?.height || quality;

  return (
    <div className="relative flex-1 min-h-[380px] lg:min-h-[580px] flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-900/60 rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-2xl overflow-hidden text-center">
      {/* Glow background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center gap-5">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-950/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{detachMode === 'window' ? 'Preview Active on External Display' : 'In-App Floating Window Active'}</span>
        </div>

        {/* Live Mini Preview Mirror */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex flex-col items-center gap-2">
          <div className="w-40 h-40 flex items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] p-2 border border-slate-800/80">
            <canvas
              ref={miniCanvasRef}
              className="max-w-full max-h-full object-contain [image-rendering:pixelated]"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">{width}×{height}px</span>
            <span>•</span>
            <span className="text-amber-400">{paletteName}</span>
            {frameCount > 1 && (
              <>
                <span>•</span>
                <span className="text-sky-400 font-medium">
                  Frame {activeFrameIndex + 1}/{frameCount} ({fps} FPS)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <span>Detached Live Preview</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Your preview is detached in a separate window. Drag it across to your secondary monitor!
            Every slider, palette, dithering, and frame rate adjustment will reflect live on your other display.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {onFocusWindow && detachMode === 'window' && (
            <button
              type="button"
              onClick={onFocusWindow}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Bring Window to Front</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReattach}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Re-attach Preview</span>
          </button>
        </div>

        {/* Detach Mode Switcher */}
        <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
          {detachMode === 'window' && onSwitchToFloating && (
            <button
              type="button"
              onClick={onSwitchToFloating}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer underline flex items-center gap-1"
            >
              <AppWindow className="w-3 h-3" />
              <span>Switch to in-app floating window</span>
            </button>
          )}
          {detachMode === 'floating' && onSwitchToWindow && (
            <button
              type="button"
              onClick={onSwitchToWindow}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Pop out to OS desktop window</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
