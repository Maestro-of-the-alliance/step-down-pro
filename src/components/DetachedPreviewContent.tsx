import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Maximize,
  Minimize,
  Grid,
  SplitSquareVertical,
  Columns,
  Image as ImageIcon,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowDownLeft,
  Play,
  Pause,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { ViewMode } from '../types';

interface DetachedPreviewContentProps {
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
  isExternalWindow?: boolean;
}

export const DetachedPreviewContent: React.FC<DetachedPreviewContentProps> = ({
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
  isExternalWindow = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitWrapperRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [isFit, setIsFit] = useState<boolean>(true);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Render pixel art onto canvas
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

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setIsFit(false);
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.833;
    setZoom((prev) => Math.min(16, Math.max(0.2, prev * zoomFactor)));
  };

  // Handle Pan Start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingSplit) return;
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isFit) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Split handle mouse movement
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
    const onMove = (e: MouseEvent) => handleSplitMove(e.clientX);
    const onUp = () => setIsDraggingSplit(false);

    if (isDraggingSplit) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingSplit, handleSplitMove]);

  // Keyboard shortcuts inside detached window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && onTogglePlay) {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'g' || e.key === 'G') {
        onToggleGrid();
      } else if (e.key === '0') {
        setIsFit(true);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onToggleGrid]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentWidth = pixelCanvas?.width || quality;
  const currentHeight = pixelCanvas?.height || quality;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`w-full h-full min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Top Floating Control Bar */}
      <header className="z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200">Detached Preview</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-semibold">{currentWidth}×{currentHeight}px</span>
              <span>•</span>
              <span className="text-amber-400">{paletteName}</span>
            </div>
          </div>

          {/* Animation status badge */}
          {totalFrames > 1 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
              <span>Frame {activeFrameIndex + 1}/{totalFrames}</span>
              <span>•</span>
              <span>{fps} FPS</span>
              {onTogglePlay && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  className="p-0.5 rounded hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer ml-0.5"
                  title={isPlaying ? 'Pause Animation' : 'Play Animation'}
                >
                  {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center: View Mode Toggles */}
        <div className="bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('pixel')}
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'pixel'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Pixel</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3 h-3" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('side-by-side')}
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Side</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('original')}
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'original'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Original</span>
          </button>
        </div>

        {/* Right: Grid, Zoom & Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* Grid Toggle */}
          <button
            type="button"
            onClick={onToggleGrid}
            title="Toggle pixel grid lines (G)"
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              showGrid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Zoom Buttons */}
          <button
            type="button"
            onClick={() => {
              setIsFit(false);
              setZoom((z) => Math.max(0.25, z / 1.4));
            }}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFit(true);
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Fit to Window (0)"
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
              isFit ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isFit ? 'FIT' : `${Math.round(zoom * 100)}%`}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFit(false);
              setZoom((z) => Math.min(16, z * 1.4));
            }}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (F)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Re-attach Button */}
          <button
            type="button"
            onClick={onClose}
            title="Re-attach preview window back to main studio"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Re-attach</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Work Area */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
        {/* VIEW MODE: PIXEL ART */}
        {viewMode === 'pixel' && (
          <div
            className="relative transition-transform duration-75 flex items-center justify-center"
            style={{
              transform: isFit
                ? 'none'
                : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-slate-900/40">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[85vh] object-contain block image-rendering-pixelated [image-rendering:pixelated]"
              />

              {/* Onion Skin Overlay if active and paused */}
              {onionSkin && onionSkinCanvas && !isPlaying && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-35"
                  style={{
                    backgroundImage: `url(${onionSkinCanvas.toDataURL()})`,
                    backgroundSize: '100% 100%',
                    imageRendering: 'pixelated',
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE: SPLIT SWIPE */}
        {viewMode === 'split' && sourceImage && pixelCanvas && (
          <div
            ref={splitWrapperRef}
            className="relative max-w-full max-h-[85vh] aspect-auto shadow-2xl rounded-lg overflow-hidden border border-slate-800 select-none"
            style={{
              transform: isFit ? 'none' : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* Background Original Image */}
            <img
              src={sourceImage.src}
              alt="Original"
              className="max-w-full max-h-[85vh] object-contain block"
            />

            {/* Foreground Pixel Art with clip path */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain [image-rendering:pixelated]"
              />
            </div>

            {/* Draggable Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
              style={{ left: `${splitPos}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingSplit(true);
              }}
            >
              <div className="w-5 h-7 rounded bg-slate-900 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-md">
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: SIDE BY SIDE */}
        {viewMode === 'side-by-side' && sourceImage && pixelCanvas && (
          <div
            className="grid grid-cols-2 gap-4 p-4 max-w-full max-h-[85vh] items-center"
            style={{
              transform: isFit ? 'none' : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Original Source</span>
              <img
                src={sourceImage.src}
                alt="Original"
                className="max-h-[75vh] object-contain rounded-lg border border-slate-800 shadow-lg"
              />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Pixel Art</span>
              <canvas
                ref={canvasRef}
                className="max-h-[75vh] object-contain rounded-lg border border-slate-800 shadow-lg [image-rendering:pixelated]"
              />
            </div>
          </div>
        )}

        {/* VIEW MODE: ORIGINAL ONLY */}
        {viewMode === 'original' && sourceImage && (
          <div
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            style={{
              transform: isFit ? 'none' : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <img
              src={sourceImage.src}
              alt="Original"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-800 shadow-2xl"
            />
          </div>
        )}
      </main>

      {/* Bottom Hint Footer */}
      <footer className="z-20 bg-slate-950/90 border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Scroll to Zoom • Drag to Pan • Space to Play/Pause</span>
          <span>•</span>
          <span>G for Grid • 0 to Reset Fit</span>
        </div>
        <div className="text-emerald-400 font-semibold">
          Adjust sliders & settings on your primary monitor to see live updates here
        </div>
      </footer>
    </div>
  );
};
