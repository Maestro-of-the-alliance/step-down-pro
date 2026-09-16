import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PixelArtSettings, ViewMode, AnimationFrame, SampleAnimationPreset } from './types';
import { PALETTES } from './utils/palettes';
import { SAMPLES } from './utils/samples';
import { ANIMATION_PRESETS } from './utils/animationPresets';
import { processPixelArt, drawPixelToDisplay, RenderResult } from './utils/pixelEngine';
import { downloadAnimatedGif, downloadSpriteSheet } from './utils/exportUtils';
import { Header } from './components/Header';
import { Viewport } from './components/Viewport';
import { ControlPanel } from './components/ControlPanel';
import { PaletteDrawer } from './components/PaletteDrawer';
import { AnimationTimeline } from './components/AnimationTimeline';

const DEFAULT_SETTINGS: PixelArtSettings = {
  quality: 64, // 64px width default retro sweet spot
  paletteId: 'pico8',
  adaptiveColorCount: 16,
  ditherType: 'floyd-steinberg',
  ditherAmount: 0.5,
  pixelStyle: 'square',
  brightness: 0,
  contrast: 10,
  saturation: 15,
  edgeOutline: 0,
  edgeColor: 'dark',
  maintainAspectRatio: true,
  pixelGrid: false,
};

export default function App() {
  const [settings, setSettings] = useState<PixelArtSettings>(DEFAULT_SETTINGS);
  const [viewMode, setViewMode] = useState<ViewMode>('pixel');
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [currentSampleId, setCurrentSampleId] = useState<string>('cyberpunk');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Animation State
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(8);
  const [loop, setLoop] = useState<boolean>(true);
  const [onionSkin, setOnionSkin] = useState<boolean>(false);

  // Render output cache for active display
  const [pixelResult, setPixelResult] = useState<RenderResult | null>(null);
  const [finalDisplayCanvas, setFinalDisplayCanvas] = useState<HTMLCanvasElement | null>(null);

  // Animation frame ref for throttling rapid slider updates
  const rafRef = useRef<number | null>(null);

  // Helper to load image object as promise
  const loadImageElement = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  // 1. Load initial sample image
  useEffect(() => {
    loadImageFromUrl(SAMPLES[0].url);
  }, []);

  // Helper to load image object
  const loadImageFromUrl = async (url: string) => {
    setIsLoading(true);
    try {
      const img = await loadImageElement(url);
      setSourceImage(img);

      // Process initial frame
      const initialResult = processPixelArt(img, settings);
      setPixelResult(initialResult);

      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = initialResult.width;
      frameCanvas.height = initialResult.height;
      const ctx = frameCanvas.getContext('2d');
      if (ctx) ctx.drawImage(initialResult.pixelCanvas, 0, 0);

      const initialFrame: AnimationFrame = {
        id: `frame-${Date.now()}`,
        name: 'Frame 1',
        sourceImageUrl: url,
        sourceImageElement: img,
        settings: { ...settings },
        pixelCanvas: frameCanvas,
        width: initialResult.width,
        height: initialResult.height,
        paletteColorsUsed: initialResult.paletteColorsUsed,
      };

      setFrames([initialFrame]);
      setActiveFrameIndex(0);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load image:', url, err);
      setIsLoading(false);
    }
  };

  // Helper to load image from file
  const handleLoadFile = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        loadImageFromUrl(e.target.result as string);
        setCurrentSampleId('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste Support (Ctrl+V anywhere)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleLoadFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Spacebar play/pause shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeEl = document.activeElement;
        const isInput =
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement;
        if (!isInput) {
          e.preventDefault();
          setIsPlaying((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Core Render Engine: Updates active frame display canvas
  const updateDisplayCanvas = useCallback(
    (canvasToDraw: HTMLCanvasElement, currentSettings: PixelArtSettings) => {
      const displayCanvas = document.createElement('canvas');
      const scale = Math.max(1, Math.min(12, Math.floor(600 / Math.max(1, canvasToDraw.width))));

      drawPixelToDisplay(
        canvasToDraw,
        displayCanvas,
        scale,
        currentSettings.pixelStyle,
        currentSettings.pixelGrid
      );

      setFinalDisplayCanvas(displayCanvas);
    },
    []
  );

  // Playback Loop: Drives activeFrameIndex forward at specified FPS
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;

    const interval = 1000 / Math.max(1, fps);
    let lastTime = performance.now();
    let animId: number;

    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime;
      if (delta >= interval) {
        lastTime = currentTime - (delta % interval);
        setActiveFrameIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= frames.length) {
            if (!loop) {
              setIsPlaying(false);
              return prevIndex;
            }
            return 0;
          }
          return nextIndex;
        });
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, frames.length, fps, loop]);

  // Synchronize active frame to display canvas
  useEffect(() => {
    const currentFrame = frames[activeFrameIndex];
    if (currentFrame && currentFrame.pixelCanvas) {
      updateDisplayCanvas(currentFrame.pixelCanvas, settings);
    }
  }, [activeFrameIndex, frames, settings.pixelStyle, settings.pixelGrid, updateDisplayCanvas, settings]);

  // Live pixel updating when user adjusts settings and NOT playing
  useEffect(() => {
    if (!sourceImage || isPlaying) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      try {
        const result = processPixelArt(sourceImage, settings);
        setPixelResult(result);

        // Update active frame in frames array
        setFrames((prevFrames) => {
          if (prevFrames.length === 0) return prevFrames;
          const updated = [...prevFrames];
          const curr = updated[activeFrameIndex];
          if (!curr) return prevFrames;

          // Copy rendered result to frame canvas
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = result.width;
          frameCanvas.height = result.height;
          const ctx = frameCanvas.getContext('2d');
          if (ctx) ctx.drawImage(result.pixelCanvas, 0, 0);

          updated[activeFrameIndex] = {
            ...curr,
            settings: { ...settings },
            pixelCanvas: frameCanvas,
            width: result.width,
            height: result.height,
            paletteColorsUsed: result.paletteColorsUsed,
          };
          return updated;
        });

        updateDisplayCanvas(result.pixelCanvas, settings);
      } catch (err) {
        console.error('Render error:', err);
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sourceImage, settings, activeFrameIndex, isPlaying, updateDisplayCanvas]);

  const updateSettings = (partial: Partial<PixelArtSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLES.find((s) => s.id === sampleId);
    if (sample) {
      setCurrentSampleId(sample.id);
      loadImageFromUrl(sample.url);
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Frame Management Handlers
  const handleSelectFrame = (index: number) => {
    if (index >= 0 && index < frames.length) {
      setActiveFrameIndex(index);
      const frame = frames[index];
      if (frame) {
        setSourceImage(frame.sourceImageElement);
      }
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    handleSelectFrame(activeFrameIndex > 0 ? activeFrameIndex - 1 : frames.length - 1);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    handleSelectFrame(activeFrameIndex < frames.length - 1 ? activeFrameIndex + 1 : 0);
  };

  const handleAddCurrentAsFrame = () => {
    if (!pixelResult || !sourceImage) return;

    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = pixelResult.width;
    clonedCanvas.height = pixelResult.height;
    const ctx = clonedCanvas.getContext('2d');
    if (ctx) ctx.drawImage(pixelResult.pixelCanvas, 0, 0);

    const newIndex = frames.length + 1;
    const newFrame: AnimationFrame = {
      id: `frame-${Date.now()}-${newIndex}`,
      name: `Frame ${newIndex}`,
      sourceImageUrl: sourceImage.src,
      sourceImageElement: sourceImage,
      settings: { ...settings },
      pixelCanvas: clonedCanvas,
      width: pixelResult.width,
      height: pixelResult.height,
      paletteColorsUsed: [...pixelResult.paletteColorsUsed],
    };

    setFrames((prev) => [...prev, newFrame]);
    setActiveFrameIndex(frames.length);
  };

  const handleDuplicateFrame = (index: number) => {
    const target = frames[index];
    if (!target) return;

    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = target.width;
    clonedCanvas.height = target.height;
    const ctx = clonedCanvas.getContext('2d');
    if (ctx) ctx.drawImage(target.pixelCanvas, 0, 0);

    const duplicated: AnimationFrame = {
      ...target,
      id: `frame-${Date.now()}`,
      name: `${target.name} (Copy)`,
      pixelCanvas: clonedCanvas,
      paletteColorsUsed: [...target.paletteColorsUsed],
    };

    const nextFrames = [...frames];
    nextFrames.splice(index + 1, 0, duplicated);
    setFrames(nextFrames);
    setActiveFrameIndex(index + 1);
  };

  const handleDeleteFrame = (index: number) => {
    if (frames.length <= 1) return;
    const nextFrames = frames.filter((_, i) => i !== index);
    setFrames(nextFrames);
    const nextIndex = Math.min(activeFrameIndex, nextFrames.length - 1);
    setActiveFrameIndex(nextIndex);
    if (nextFrames[nextIndex]) {
      setSourceImage(nextFrames[nextIndex].sourceImageElement);
    }
  };

  const handleMoveFrame = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= frames.length) return;
    const nextFrames = [...frames];
    const [moved] = nextFrames.splice(fromIndex, 1);
    nextFrames.splice(toIndex, 0, moved);
    setFrames(nextFrames);
    setActiveFrameIndex(toIndex);
  };

  // Batch upload images for sprite walk cycles or animations
  const handleUploadBatchImages = async (fileList: FileList) => {
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const files = Array.from(fileList);
      const loadedFrames: AnimationFrame[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const img = await loadImageElement(dataUrl);
        const result = processPixelArt(img, settings);

        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = result.width;
        frameCanvas.height = result.height;
        const ctx = frameCanvas.getContext('2d');
        if (ctx) ctx.drawImage(result.pixelCanvas, 0, 0);

        loadedFrames.push({
          id: `frame-${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          sourceImageUrl: dataUrl,
          sourceImageElement: img,
          settings: { ...settings },
          pixelCanvas: frameCanvas,
          width: result.width,
          height: result.height,
          paletteColorsUsed: result.paletteColorsUsed,
        });
      }

      if (loadedFrames.length > 0) {
        setFrames(loadedFrames);
        setActiveFrameIndex(0);
        setSourceImage(loadedFrames[0].sourceImageElement);
        setPixelResult(processPixelArt(loadedFrames[0].sourceImageElement, settings));
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Batch frame load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample animated preset
  const handleLoadPreset = async (preset: SampleAnimationPreset) => {
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const loadedFrames: AnimationFrame[] = [];

      for (let i = 0; i < preset.frames.length; i++) {
        const frameData = preset.frames[i];
        const img = await loadImageElement(frameData.url);
        const result = processPixelArt(img, settings);

        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = result.width;
        frameCanvas.height = result.height;
        const ctx = frameCanvas.getContext('2d');
        if (ctx) ctx.drawImage(result.pixelCanvas, 0, 0);

        loadedFrames.push({
          id: `preset-${preset.id}-${i}-${Date.now()}`,
          name: frameData.name,
          sourceImageUrl: frameData.url,
          sourceImageElement: img,
          settings: { ...settings },
          pixelCanvas: frameCanvas,
          width: result.width,
          height: result.height,
          paletteColorsUsed: result.paletteColorsUsed,
        });
      }

      setFrames(loadedFrames);
      setActiveFrameIndex(0);
      setFps(preset.fps);
      if (loadedFrames[0]) {
        setSourceImage(loadedFrames[0].sourceImageElement);
      }
      setIsPlaying(true);
    } catch (err) {
      console.error('Preset loading failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync settings (quality, palette, dithering) across every frame
  const handleApplySettingsToAll = () => {
    setIsLoading(true);
    setTimeout(() => {
      setFrames((prev) =>
        prev.map((frame) => {
          const result = processPixelArt(frame.sourceImageElement, settings);
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = result.width;
          frameCanvas.height = result.height;
          const ctx = frameCanvas.getContext('2d');
          if (ctx) ctx.drawImage(result.pixelCanvas, 0, 0);

          return {
            ...frame,
            settings: { ...settings },
            pixelCanvas: frameCanvas,
            width: result.width,
            height: result.height,
            paletteColorsUsed: result.paletteColorsUsed,
          };
        })
      );
      setIsLoading(false);
    }, 10);
  };

  const activePalette = PALETTES.find((p) => p.id === settings.paletteId);
  const aspectRatio = sourceImage ? sourceImage.width / sourceImage.height : 1;
  const activeFrame = frames[activeFrameIndex];

  const currentPixelDims = activeFrame
    ? { width: activeFrame.width, height: activeFrame.height }
    : pixelResult
    ? { width: pixelResult.width, height: pixelResult.height }
    : { width: settings.quality, height: Math.round(settings.quality / (aspectRatio || 1)) };

  // Onion skinning canvas reference
  const prevFrameIndex = (activeFrameIndex - 1 + frames.length) % Math.max(1, frames.length);
  const onionSkinCanvas =
    onionSkin && frames.length > 1 && !isPlaying && frames[prevFrameIndex]
      ? frames[prevFrameIndex].pixelCanvas
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Application Bar */}
      <Header
        pixelCanvas={activeFrame ? activeFrame.pixelCanvas : pixelResult ? pixelResult.pixelCanvas : null}
        dimensions={currentPixelDims}
        colorCount={activeFrame ? activeFrame.paletteColorsUsed.length : pixelResult ? pixelResult.paletteColorsUsed.length : 0}
        paletteName={activePalette?.name || 'Custom'}
        paletteColors={activeFrame ? activeFrame.paletteColorsUsed : pixelResult ? pixelResult.paletteColorsUsed : []}
        frameCount={frames.length}
        onUploadImage={handleLoadFile}
        onSelectSample={handleSelectSample}
        onResetSettings={handleResetSettings}
        onExportGif={(scale) => downloadAnimatedGif(frames, fps, scale)}
        onExportSpritesheet={(scale, layout) => downloadSpriteSheet(frames, scale, layout)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Quality Banner Quick Indicator */}
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Real-time Quality Slider:</span>
            <span className="text-emerald-400 font-mono font-bold">{settings.quality} px</span>
            <span className="text-slate-500 hidden sm:inline">• Slide to lower or raise pixel resolution instantly</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-slate-400">
            <span>Quick Quality:</span>
            {[24, 48, 64, 96, 128, 192].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => updateSettings({ quality: q })}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  settings.quality === q
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'
                }`}
              >
                {q}px
              </button>
            ))}
          </div>
        </div>

        {/* Studio Workspace: Viewport + Timeline + Control Panel */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Main Visual Display Viewport & Timeline Stack */}
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <Viewport
              pixelCanvas={finalDisplayCanvas}
              sourceImage={sourceImage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showGrid={settings.pixelGrid}
              onToggleGrid={() => updateSettings({ pixelGrid: !settings.pixelGrid })}
              onDropFile={handleLoadFile}
              isLoading={isLoading}
              onionSkin={onionSkin}
              onionSkinCanvas={onionSkinCanvas}
              isPlaying={isPlaying}
              activeFrameIndex={activeFrameIndex}
              totalFrames={frames.length}
              fps={fps}
            />

            {/* Animation Timeline Component */}
            <AnimationTimeline
              frames={frames}
              activeFrameIndex={activeFrameIndex}
              isPlaying={isPlaying}
              fps={fps}
              loop={loop}
              onionSkin={onionSkin}
              onSelectFrame={handleSelectFrame}
              onTogglePlay={handleTogglePlay}
              onStepPrev={handleStepPrev}
              onStepNext={handleStepNext}
              onChangeFps={setFps}
              onToggleLoop={() => setLoop((prev) => !prev)}
              onToggleOnionSkin={() => setOnionSkin((prev) => !prev)}
              onAddCurrentAsFrame={handleAddCurrentAsFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onDeleteFrame={handleDeleteFrame}
              onMoveFrame={handleMoveFrame}
              onUploadBatchImages={handleUploadBatchImages}
              onLoadPreset={handleLoadPreset}
              onApplySettingsToAll={handleApplySettingsToAll}
              onExportGif={(scale) => downloadAnimatedGif(frames, fps, scale)}
              onExportSpritesheet={(scale, layout) => downloadSpriteSheet(frames, scale, layout)}
            />

            {/* Extracted Palette Swatches */}
            {activeFrame && (
              <PaletteDrawer
                colors={activeFrame.paletteColorsUsed}
                paletteName={activePalette?.name || 'Custom'}
              />
            )}
          </div>

          {/* Controls Sidebar */}
          <ControlPanel
            settings={settings}
            onChangeSettings={updateSettings}
            aspectRatio={aspectRatio}
            fps={fps}
            onChangeFps={setFps}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            frameCount={frames.length}
            onApplySettingsToAll={handleApplySettingsToAll}
          />
        </div>
      </main>
    </div>
  );
}

