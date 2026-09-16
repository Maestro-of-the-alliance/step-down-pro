import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  ExternalLink,
  GripHorizontal,
  Monitor,
  ArrowDownLeft
} from 'lucide-react';
import { ViewMode } from '../types';
import { DetachedPreviewContent } from './DetachedPreviewContent';

interface FloatingPreviewProps {
  pixelCanvas: HTMLCanvasElement | null;
  sourceImage: HTMLImageElement | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onionSkin?: boolean;
  onionSkinCanvas?: HTMLCanvasElement | null;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  activeFrameIndex?: number;
  totalFrames?: number;
  fps?: number;
  quality?: number;
  paletteName?: string;
  onClose: () => void;
  onPopoutToWindow?: () => void;
  onOpenDetachedTab?: () => void;
}

export const FloatingPreview: React.FC<FloatingPreviewProps> = ({
  pixelCanvas,
  sourceImage,
  viewMode,
  onViewModeChange,
  showGrid,
  onToggleGrid,
  onionSkin = false,
  onionSkinCanvas = null,
  isPlaying = false,
  onTogglePlay,
  activeFrameIndex = 0,
  totalFrames = 1,
  fps = 8,
  quality = 64,
  paletteName = 'Pico-8',
  onClose,
  onPopoutToWindow,
  onOpenDetachedTab,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: Math.max(20, window.innerWidth - 680),
    y: 80,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 620,
    height: 480,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    // Only drag from header bar, not buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '340px' : `${size.width}px`,
        height: isMinimized ? '44px' : `${size.height}px`,
        zIndex: 9999,
      }}
      className="rounded-2xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl transition-size duration-150"
    >
      {/* Draggable Title Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between cursor-move select-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-500" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Floating Preview</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="flex items-center gap-1">
          {onOpenDetachedTab && (
            <button
              type="button"
              onClick={onOpenDetachedTab}
              title="Open live-synced preview in new tab (for multi-display)"
              className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {onPopoutToWindow && (
            <button
              type="button"
              onClick={onPopoutToWindow}
              title="Pop out to separate OS window"
              className="p-1 rounded-md text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Expand window' : 'Minimize window'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Re-attach preview to main workspace"
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isMinimized && (
        <div className="flex-1 w-full h-[calc(100%-44px)] overflow-hidden relative">
          <DetachedPreviewContent
            pixelCanvas={pixelCanvas}
            sourceImage={sourceImage}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            showGrid={showGrid}
            onToggleGrid={onToggleGrid}
            onionSkin={onionSkin}
            onionSkinCanvas={onionSkinCanvas}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            activeFrameIndex={activeFrameIndex}
            totalFrames={totalFrames}
            fps={fps}
            quality={quality}
            paletteName={paletteName}
            onClose={onClose}
            isExternalWindow={false}
          />
        </div>
      )}
    </div>
  );
};
