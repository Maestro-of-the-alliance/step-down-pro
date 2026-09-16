import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Download,
  Copy,
  Check,
  Palette as PaletteIcon,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  Maximize2,
  Film,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { SAMPLES } from '../utils/samples';
import { downloadPixelArt, copyPixelArtToClipboard, downloadPaletteImage } from '../utils/exportUtils';

interface HeaderProps {
  pixelCanvas: HTMLCanvasElement | null;
  dimensions: { width: number; height: number };
  colorCount: number;
  paletteName: string;
  paletteColors: [number, number, number][];
  frameCount?: number;
  isDetached?: boolean;
  onToggleDetach?: () => void;
  onUploadImage: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
  onResetSettings: () => void;
  onExportGif?: (scale: number) => void;
  onExportSpritesheet?: (scale: number, layout: 'horizontal' | 'grid') => void;
}

export const Header: React.FC<HeaderProps> = ({
  pixelCanvas,
  dimensions,
  colorCount,
  paletteName,
  paletteColors,
  frameCount = 1,
  isDetached = false,
  onToggleDetach,
  onUploadImage,
  onSelectSample,
  onResetSettings,
  onExportGif,
  onExportSpritesheet,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const handleCopy = async () => {
    if (!pixelCanvas) return;
    const success = await copyPixelArtToClipboard(pixelCanvas, 4);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            {/* Pixelated grid icon */}
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-emerald-400 rounded-[1px]" />
              <div className="bg-emerald-300 rounded-[1px]" />
              <div className="bg-emerald-600 rounded-[1px]" />
              <div className="bg-emerald-400 rounded-[1px]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                Pixel Art Converter
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>{dimensions.width} × {dimensions.height} px</span>
              <span className="text-slate-600">•</span>
              <span>{colorCount} colors</span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 hidden md:inline truncate max-w-[120px]">{paletteName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Sample Picker */}
          <div className="relative">
            <button
              id="sample-picker-btn"
              type="button"
              onClick={() => setSampleMenuOpen(!sampleMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Presets</span>
            </button>

            {sampleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSampleMenuOpen(false)}
                />
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Sample Images
                  </div>
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        onSelectSample(sample.id);
                        setSampleMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <span className="font-medium">{sample.name}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                        {sample.category}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            id="upload-image-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Upload</span>
          </button>

          {/* Reset Settings */}
          <button
            id="reset-settings-btn"
            type="button"
            onClick={onResetSettings}
            title="Reset settings to default"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Detach Window Button */}
          {onToggleDetach && (
            <button
              id="header-detach-btn"
              type="button"
              onClick={onToggleDetach}
              title={isDetached ? 'Re-attach preview window' : 'Detach preview to another display'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                isDetached
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-emerald-300'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isDetached ? 'Detached' : 'Detach'}</span>
            </button>
          )}

          {/* Export & Copy Dropdown */}
          <div className="relative">
            <button
              id="export-menu-btn"
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Download Crisp PNG
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (pixelCanvas) downloadPixelArt(pixelCanvas, 1);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Native 1× Scale</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {dimensions.width}×{dimensions.height}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pixelCanvas) downloadPixelArt(pixelCanvas, 4);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Crisp 4× Upscale</span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      {dimensions.width * 4}×{dimensions.height * 4}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pixelCanvas) downloadPixelArt(pixelCanvas, 8);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Poster 8× Scale</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {dimensions.width * 8}×{dimensions.height * 8}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pixelCanvas) downloadPixelArt(pixelCanvas, 16);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Ultra HD 16× Scale</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {dimensions.width * 16}×{dimensions.height * 16}
                    </span>
                  </button>

                  {frameCount > 1 && onExportGif && (
                    <>
                      <div className="my-1 border-t border-slate-800" />
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        <span>Animation ({frameCount} Frames)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onExportGif(4);
                          setExportOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Animated Looping GIF</span>
                        <span className="font-mono text-[10px] text-emerald-400">4× Crisp</span>
                      </button>
                      {onExportSpritesheet && (
                        <button
                          type="button"
                          onClick={() => {
                            onExportSpritesheet(2, 'horizontal');
                            setExportOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Spritesheet Strip</span>
                          <span className="font-mono text-[10px] text-slate-400">PNG</span>
                        </button>
                      )}
                    </>
                  )}

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    type="button"
                    onClick={() => {
                      handleCopy();
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard (4×)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadPaletteImage(paletteColors, paletteName);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <PaletteIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Palette Swatch</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
