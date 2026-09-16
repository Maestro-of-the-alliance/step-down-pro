import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  SplitSquareVertical,
  Columns,
  Image as ImageIcon,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink
} from 'lucide-react';
import { ViewMode } from '../types';
import {
  BROADCAST_CHANNEL_NAME,
  STORAGE_BACKUP_KEY,
  StudioSyncPayload,
  BroadcastMessage,
  sendBroadcastMessage,
} from '../utils/broadcastSync';

export const StandaloneDetachedViewer: React.FC = () => {
  const [syncData, setSyncData] = useState<StudioSyncPayload | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnectionLost, setIsConnectionLost] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('pixel');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Zoom and Pan
  const [zoom, setZoom] = useState<number>(1);
  const [isFit, setIsFit] = useState<boolean>(true);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Split View Slider
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitWrapperRef = useRef<HTMLDivElement>(null);

  // Reconstructed Canvas and Images
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceImageElement, setSourceImageElement] = useState<HTMLImageElement | null>(null);
  const [onionSkinImageElement, setOnionSkinImageElement] = useState<HTMLImageElement | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const hasEverConnectedRef = useRef<boolean>(false);

  // Helper to request sync
  const requestSync = useCallback(() => {
    sendBroadcastMessage(channelRef.current, { type: 'REQUEST_SYNC' });
  }, []);

  // Update canvas whenever rendered pixel data url changes
  useEffect(() => {
    if (!syncData?.renderedPixelDataUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = syncData.renderedPixelDataUrl;
  }, [syncData?.renderedPixelDataUrl]);

  // Update source image element
  useEffect(() => {
    if (!syncData?.sourceImageUrl) {
      setSourceImageElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setSourceImageElement(img);
    img.src = syncData.sourceImageUrl;
  }, [syncData?.sourceImageUrl]);

  // Update onion skin image element
  useEffect(() => {
    if (!syncData?.onionSkinDataUrl) {
      setOnionSkinImageElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setOnionSkinImageElement(img);
    img.src = syncData.onionSkinDataUrl;
  }, [syncData?.onionSkinDataUrl]);

  // Setup BroadcastChannel and storage fallback
  useEffect(() => {
    document.title = 'Pixel Art Studio - Detached Live Viewer';

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channelRef.current = channel;
      }
    } catch (e) {
      console.warn('BroadcastChannel not available, using localStorage sync fallback:', e);
    }

    const handleMessage = (msg: BroadcastMessage) => {
      if (msg.type === 'STUDIO_STATE_UPDATE') {
        lastHeartbeatRef.current = Date.now();
        hasEverConnectedRef.current = true;
        setIsConnected(true);
        setIsConnectionLost(false);
        setSyncData(msg.payload);
        setShowGrid(msg.payload.settings.pixelGrid);
      } else if (msg.type === 'HEARTBEAT') {
        lastHeartbeatRef.current = Date.now();
        hasEverConnectedRef.current = true;
        setIsConnected(true);
        setIsConnectionLost(false);
      } else if (msg.type === 'STUDIO_DISCONNECT') {
        setIsConnectionLost(true);
      }
    };

    if (channel) {
      channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        if (event.data) {
          handleMessage(event.data);
        }
      };
    }

    // LocalStorage Fallback listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_BACKUP_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.message) {
            handleMessage(parsed.message);
          }
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // Initial check from localStorage in case state was already written
    try {
      const stored = localStorage.getItem(STORAGE_BACKUP_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.message) {
          handleMessage(parsed.message);
        }
      }
    } catch (e) {
      // ignore
    }

    // Ping master for immediate state sync
    requestSync();
    const t1 = setTimeout(requestSync, 300);
    const t2 = setTimeout(requestSync, 1000);

    // Watchdog timer: check connection health every 1.5s
    const watchdogInterval = setInterval(() => {
      const elapsed = Date.now() - lastHeartbeatRef.current;
      if (hasEverConnectedRef.current && elapsed > 4500) {
        setIsConnectionLost(true);
      }
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(watchdogInterval);
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [requestSync]);

  // Sync viewMode from master on first load or when master changes viewMode
  useEffect(() => {
    if (syncData?.viewMode) {
      setViewMode(syncData.viewMode);
    }
  }, [syncData?.viewMode]);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setIsFit(false);
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.833;
    setZoom((prev) => Math.min(16, Math.max(0.2, prev * zoomFactor)));
  };

  // Handle Pan
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

  // Split handle movement
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid((prev) => !prev);
      } else if (e.key === '0') {
        setIsFit(true);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        requestSync();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestSync]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const dimensions = syncData?.dimensions || { width: 64, height: 64 };

  return (
    <div
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`min-h-screen w-screen flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Top Floating Control Bar */}
      <header className="z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Pixel Art Studio</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Detached Viewer</span>

              {/* Status Badge */}
              {isConnectionLost ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-400 text-[10px] font-semibold animate-pulse">
                  <WifiOff className="w-3 h-3" />
                  <span>Connection Lost</span>
                </span>
              ) : isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Synced</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-semibold">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Connecting...</span>
                </span>
              )}
            </div>

            {syncData && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">{dimensions.width}×{dimensions.height}px</span>
                <span>•</span>
                <span className="text-amber-400">{syncData.paletteName}</span>
                {syncData.totalFrames > 1 && (
                  <>
                    <span>•</span>
                    <span className="text-sky-400">
                      Frame {syncData.activeFrameIndex + 1}/{syncData.totalFrames} ({syncData.fps} FPS)
                    </span>
                    {syncData.isPlaying ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5 fill-current" /> Playing
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-0.5">
                        <Pause className="w-2.5 h-2.5 fill-current" /> Paused
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: View Mode Toggles */}
        {syncData && (
          <div className="bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('pixel')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
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
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
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
              onClick={() => setViewMode('side-by-side')}
              className={`hidden sm:flex px-2.5 py-1 rounded text-xs font-medium items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'original'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Original</span>
            </button>
          </div>
        )}

        {/* Right: Grid, Zoom & Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* Reconnect / Refresh button */}
          <button
            type="button"
            onClick={requestSync}
            title="Request sync update from master tab (R)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
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

          {/* Zoom Controls */}
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
        </div>
      </header>

      {/* Connection Lost Warning Banner */}
      {isConnectionLost && (
        <div className="z-20 bg-rose-950/90 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Connection Lost:</strong> The original Pixel Art Studio tab was closed or is unresponsive. Displaying last synced frame.
            </span>
          </div>
          <button
            type="button"
            onClick={requestSync}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Try Reconnecting</span>
          </button>
        </div>
      )}

      {/* Main Canvas Work Area */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Waiting for initial sync */}
        {!syncData && (
          <div className="flex flex-col items-center justify-center p-8 max-w-md text-center gap-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-100">Connecting to Pixel Art Studio...</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Listening for real-time broadcasts on your browser. Make sure your main Pixel Art Studio tab is open and running.
              </p>
            </div>
            <button
              type="button"
              onClick={requestSync}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ping Studio Tab</span>
            </button>
          </div>
        )}

        {/* VIEW MODE: PIXEL ART */}
        {syncData && viewMode === 'pixel' && (
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

              {/* Pixel Grid Lines Overlay */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)`,
                    backgroundSize: `calc(100% / ${dimensions.width}) calc(100% / ${dimensions.height})`,
                  }}
                />
              )}

              {/* Onion Skin Overlay */}
              {syncData.onionSkin && onionSkinImageElement && !syncData.isPlaying && (
                <img
                  src={onionSkinImageElement.src}
                  alt="Onion Skin"
                  className="absolute inset-0 pointer-events-none opacity-35 max-w-full max-h-[85vh] object-contain [image-rendering:pixelated]"
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE: SPLIT SWIPE */}
        {syncData && viewMode === 'split' && sourceImageElement && (
          <div
            ref={splitWrapperRef}
            className="relative max-w-full max-h-[85vh] aspect-auto shadow-2xl rounded-lg overflow-hidden border border-slate-800 select-none"
            style={{
              transform: isFit ? 'none' : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* Background Original Image */}
            <img
              src={sourceImageElement.src}
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
        {syncData && viewMode === 'side-by-side' && sourceImageElement && (
          <div
            className="grid grid-cols-2 gap-4 p-4 max-w-full max-h-[85vh] items-center"
            style={{
              transform: isFit ? 'none' : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Original Source</span>
              <img
                src={sourceImageElement.src}
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
        {syncData && viewMode === 'original' && sourceImageElement && (
          <div
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            style={{
              transform: isFit ? 'none' : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <img
              src={sourceImageElement.src}
              alt="Original"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-800 shadow-2xl"
            />
          </div>
        )}
      </main>

      {/* Bottom Info Footer */}
      <footer className="z-20 bg-slate-950/95 border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Scroll to Zoom • Drag to Pan • G for Grid • 0 to Fit • F for Fullscreen</span>
        </div>
        <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Mirrored Live Display • Controlled from main studio tab</span>
        </div>
      </footer>
    </div>
  );
};
