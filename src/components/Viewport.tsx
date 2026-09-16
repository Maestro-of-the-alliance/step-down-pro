import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  SplitSquareVertical,
  Columns,
  Image as ImageIcon,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { ViewMode } from '../types';

interface ViewportProps {
  pixelCanvas: HTMLCanvasElement | null;
  sourceImage: HTMLImageElement | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onDropFile: (file: File) => void;
  isLoading: boolean;
  onionSkin?: boolean;
  onionSkinCanvas?: HTMLCanvasElement | null;
  isPlaying?: boolean;
  activeFrameIndex?: number;
  totalFrames?: number;
  fps?: number;
}

export const Viewport: React.FC<ViewportProps> = ({
  pixelCanvas,
  sourceImage,
  viewMode,
  onViewModeChange,
  showGrid,
  onToggleGrid,
  onDropFile,
  isLoading,
  onionSkin = false,
  onionSkinCanvas = null,
  isPlaying = false,
  activeFrameIndex = 0,
  totalFrames = 1,
  fps = 8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splitWrapperRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1); // 1 = fit / 100%
  const [isFit, setIsFit] = useState<boolean>(true);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0..100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Draw pixel canvas onto viewport canvas
  useEffect(() => {
    if (!pixelCanvas || !canvasRef.current) return;
    const displayCanvas = canvasRef.current;
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    displayCanvas.width = pixelCanvas.width;
    displayCanvas.height = pixelCanvas.height;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0);
  }, [pixelCanvas]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onDropFile(file);
    }
  };

  // Split handle mouse/touch movement
  const handleSplitStart = () => {
    setIsDraggingSplit(true);
  };

  const handleSplitMove = useCallback(
    (clientX: number) => {
      if (!isDraggingSplit || !splitWrapperRef.current) return;
      const rect = splitWrapperRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPos(percentage);
    },
    [isDraggingSplit]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleSplitMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleSplitMove(e.touches[0].clientX);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSplit, handleSplitMove]);

  // Zoom controls
  const handleZoomIn = () => {
    setIsFit(false);
    setZoom((prev) => Math.min(8, prev * 1.5));
  };

  const handleZoomOut = () => {
    setIsFit(false);
    setZoom((prev) => Math.max(0.25, prev / 1.5));
  };

  const handleFit = () => {
    setIsFit(true);
    setZoom(1);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 min-h-[380px] lg:min-h-[580px] flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl select-none"
    >
      {/* Top Floating Viewport Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none gap-2">
        {/* View Mode Switcher */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => onViewModeChange('pixel')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'pixel'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pixel Art</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Swipe</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('side-by-side')}
            className={`hidden sm:flex px-2.5 py-1 rounded-lg text-xs font-medium items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('original')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'original'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>
        </div>

        {/* Zoom & Grid Controls */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-lg">
          <button
            type="button"
            onClick={onToggleGrid}
            title="Toggle pixel grid lines"
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              showGrid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 my-auto" />

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFit}
            title="Fit to view"
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
              isFit
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isFit ? 'FIT' : `${Math.round(zoom * 100)}%`}
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Work Area with Retro Checkerboard */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-6 sm:p-12 overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Rendering pixel art...</span>
            </div>
          </div>
        )}

        {/* Drag & Drop Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-30 bg-emerald-950/70 backdrop-blur-sm border-2 border-dashed border-emerald-400 m-4 rounded-xl flex flex-col items-center justify-center text-emerald-200 gap-3">
            <UploadCloud className="w-12 h-12 animate-bounce text-emerald-400" />
            <p className="text-sm font-semibold">Drop your image here to pixelate</p>
            <p className="text-xs text-emerald-300/80">Supports PNG, JPEG, WebP, SVG</p>
          </div>
        )}

        {/* VIEW MODE: PIXEL ART */}
        {viewMode === 'pixel' && (
          <div
            className="relative transition-transform duration-75 flex items-center justify-center"
            style={{
              transform: isFit ? 'none' : `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="relative">
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-slate-800 [image-rendering:pixelated] ${
                  showGrid ? 'ring-1 ring-emerald-500/20' : ''
                }`}
              />

              {/* Onion Skinning Ghost Layer */}
              {onionSkin && onionSkinCanvas && (
                <canvas
                  ref={(node) => {
                    if (node && onionSkinCanvas) {
                      node.width = onionSkinCanvas.width;
                      node.height = onionSkinCanvas.height;
                      const ctx = node.getContext('2d');
                      if (ctx) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(onionSkinCanvas, 0, 0);
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-30 [image-rendering:pixelated] mix-blend-screen"
                />
              )}

              {/* Animation Playback Indicator Badge */}
              {isPlaying && (
                <div className="absolute top-2 left-2 pointer-events-none px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-xs flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    F#{activeFrameIndex + 1}/{totalFrames} • {fps} FPS
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE: SPLIT SLIDER */}
        {viewMode === 'split' && sourceImage && pixelCanvas && (
          <div
            ref={splitWrapperRef}
            className="relative max-w-full max-h-[70vh] flex items-center justify-center select-none"
            style={{
              transform: isFit ? 'none' : `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-800">
              {/* Layer 1: Pixel Art (Full Width underneath) */}
              <canvas
                ref={canvasRef}
                className="block max-w-full max-h-[70vh] [image-rendering:pixelated]"
              />

              {/* Layer 2: Original Image (Clipped to splitPos) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${splitPos}%` }}
              >
                <img
                  src={sourceImage.src}
                  alt="Original"
                  className="block h-full max-w-none object-cover"
                  style={{
                    width: splitWrapperRef.current?.querySelector('canvas')?.clientWidth || 'auto',
                    height: splitWrapperRef.current?.querySelector('canvas')?.clientHeight || 'auto',
                  }}
                />
              </div>

              {/* Draggable Divider Line & Knob */}
              <div
                onMouseDown={handleSplitStart}
                onTouchStart={handleSplitStart}
                className="absolute inset-y-0 w-1 bg-emerald-400/90 shadow-lg cursor-ew-resize z-10 flex items-center justify-center"
                style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-400 text-emerald-400 shadow-xl flex items-center justify-center text-[10px] font-bold">
                  ↔
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300 pointer-events-none">
                Original
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-emerald-400 pointer-events-none">
                Pixel Art
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: SIDE-BY-SIDE */}
        {viewMode === 'side-by-side' && sourceImage && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full max-h-[70vh] items-center justify-center"
            style={{
              transform: isFit ? 'none' : `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Original Card */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-xl bg-slate-900/50 flex flex-col items-center">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300">
                Original Photo
              </div>
              <img
                src={sourceImage.src}
                alt="Original"
                className="max-h-[60vh] object-contain"
              />
            </div>

            {/* Pixel Art Card */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-xl bg-slate-900/50 flex flex-col items-center">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-emerald-400">
                Pixel Art Output
              </div>
              <canvas
                ref={canvasRef}
                className="max-h-[60vh] object-contain [image-rendering:pixelated]"
              />
            </div>
          </div>
        )}

        {/* VIEW MODE: ORIGINAL ONLY */}
        {viewMode === 'original' && sourceImage && (
          <div
            className="relative flex items-center justify-center max-w-full max-h-[70vh]"
            style={{
              transform: isFit ? 'none' : `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={sourceImage.src}
              alt="Original"
              className="max-h-[70vh] object-contain rounded-lg border border-slate-800 shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Bottom status line */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Tip: Drag any image or paste from clipboard (Ctrl+V)</span>
        </div>
        <div>
          <span>Crisp Nearest-Neighbor Resampling</span>
        </div>
      </div>
    </div>
  );
};
