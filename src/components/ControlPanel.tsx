import React from 'react';
import {
  Sliders,
  Palette as PaletteIcon,
  Layers,
  Sparkles,
  Sun,
  Contrast,
  CircleDot,
  Tv,
  Square,
  Grid,
  ChevronDown,
  Wand2,
  Film,
  Play,
  Pause,
  Repeat
} from 'lucide-react';
import { DitherType, PixelArtSettings, PixelStyle } from '../types';
import { PALETTES, rgbToHex } from '../utils/palettes';

interface ControlPanelProps {
  settings: PixelArtSettings;
  onChangeSettings: (newSettings: Partial<PixelArtSettings>) => void;
  aspectRatio: number;
  // Animation integration
  fps?: number;
  onChangeFps?: (fps: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  frameCount?: number;
  onApplySettingsToAll?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onChangeSettings,
  aspectRatio,
  fps = 8,
  onChangeFps,
  isPlaying = false,
  onTogglePlay,
  frameCount = 1,
  onApplySettingsToAll,
}) => {
  const calculatedHeight = Math.max(8, Math.round(settings.quality / (aspectRatio || 1)));

  // Quality Tier Label
  const getQualityTierLabel = (q: number) => {
    if (q <= 20) return 'Micro Pixel / Icon (8-bit)';
    if (q <= 40) return 'Classic 8-Bit (Game Boy / NES)';
    if (q <= 72) return 'Retro 16-Bit (SNES / Genesis)';
    if (q <= 120) return 'Arcade & Detail (Neo Geo)';
    if (q <= 180) return 'Fine Pixel Illustration';
    return 'Ultra HD Crisp Mosaic';
  };

  const PRESET_RESOLUTIONS = [
    { label: '16px', value: 16 },
    { label: '32px', value: 32 },
    { label: '64px', value: 64 },
    { label: '96px', value: 96 },
    { label: '128px', value: 128 },
    { label: '192px', value: 192 },
  ];

  return (
    <div className="w-full lg:w-96 flex flex-col gap-4">
      {/* 1. PRIMARY HERO SECTION: QUALITY SLIDING SCALE */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl shadow-emerald-950/10 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-100">Quality & Detail</span>
              <p className="text-[11px] text-emerald-400 font-mono">
                {getQualityTierLabel(settings.quality)}
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold">
            {settings.quality} × {calculatedHeight} px
          </div>
        </div>

        {/* The Main Quality Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Low (Chunky)</span>
            <span className="text-emerald-400 font-bold">{settings.quality} px</span>
            <span>High (Fine)</span>
          </div>

          <input
            id="quality-slider"
            type="range"
            min={12}
            max={256}
            step={1}
            value={settings.quality}
            onChange={(e) => onChangeSettings({ quality: Number(e.target.value) })}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />

          {/* Quick preset chips */}
          <div className="grid grid-cols-6 gap-1 pt-2">
            {PRESET_RESOLUTIONS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChangeSettings({ quality: preset.value })}
                className={`py-1 text-[11px] font-mono rounded border transition-all ${
                  settings.quality === preset.value
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1B. ANIMATION FRAME RATE & PLAYBACK (When sequence exists) */}
      {frameCount > 1 && onChangeFps && (
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Animation Rate
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {fps} FPS
              </span>
              {onTogglePlay && (
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-2.5 h-2.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 FPS (Slow)</span>
              <span>{Math.round(1000 / fps)} ms/frame</span>
              <span>24 FPS (Fast)</span>
            </div>
            <input
              id="control-fps-slider"
              type="range"
              min={1}
              max={24}
              step={1}
              value={fps}
              onChange={(e) => onChangeFps(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {onApplySettingsToAll && (
            <button
              type="button"
              onClick={onApplySettingsToAll}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Current Style to All {frameCount} Frames</span>
            </button>
          )}
        </div>
      )}

      {/* 2. COLOR PALETTE */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PaletteIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Color Palette
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {PALETTES.find((p) => p.id === settings.paletteId)?.name || 'Custom'}
          </span>
        </div>

        {/* Palette Card Grid */}
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {PALETTES.map((pal) => {
            const isSelected = settings.paletteId === pal.id;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => onChangeSettings({ paletteId: pal.id })}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/70 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-medium truncate ${
                      isSelected ? 'text-emerald-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {pal.name}
                  </span>
                </div>

                {/* Color Swatch Dots */}
                <div className="flex items-center gap-0.5 overflow-hidden h-3 w-full rounded bg-slate-950/80 p-0.5">
                  {pal.colors.length === 0 ? (
                    <div className="w-full h-full bg-linear-to-r from-red-500 via-green-500 to-blue-500 rounded-xs opacity-70" />
                  ) : (
                    pal.colors.slice(0, 10).map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full rounded-[1px]"
                        style={{ backgroundColor: rgbToHex(c[0], c[1], c[2]) }}
                      />
                    ))
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Adaptive Color Count Slider (if Adaptive selected) */}
        {settings.paletteId === 'adaptive' && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Adaptive Palette Colors</span>
              <span className="text-emerald-400 font-bold">{settings.adaptiveColorCount}</span>
            </div>
            <input
              type="range"
              min={2}
              max={64}
              step={1}
              value={settings.adaptiveColorCount}
              onChange={(e) => onChangeSettings({ adaptiveColorCount: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        )}
      </div>

      {/* 3. DITHERING */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Dithering Engine
            </span>
          </div>
        </div>

        {/* Dither Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(
            [
              { id: 'none', label: 'None' },
              { id: 'floyd-steinberg', label: 'Floyd' },
              { id: 'bayer4', label: 'Bayer 4×4' },
              { id: 'bayer8', label: 'Bayer 8×8' },
            ] as { id: DitherType; label: string }[]
          ).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChangeSettings({ ditherType: d.id })}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                settings.ditherType === d.id
                  ? 'bg-sky-500/20 border-sky-400/60 text-sky-300 font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Dither Amount Slider (if dither is active) */}
        {settings.ditherType !== 'none' && (
          <div className="pt-1 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Dither Strength</span>
              <span className="text-sky-400 font-bold">{Math.round(settings.ditherAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.ditherAmount}
              onChange={(e) => onChangeSettings({ ditherAmount: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        )}
      </div>

      {/* 4. PIXEL STYLE & SHADERS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Pixel Shaders
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'square', label: 'Classic Square' },
              { id: 'scanlines', label: 'Scanlines' },
              { id: 'crt', label: 'CRT Monitor' },
              { id: 'dots', label: 'Bead Dots' },
              { id: 'mosaic', label: 'Cross-Stitch' },
            ] as { id: PixelStyle; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChangeSettings({ pixelStyle: s.id })}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center truncate ${
                settings.pixelStyle === s.id
                  ? 'bg-purple-500/20 border-purple-400/60 text-purple-300 font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. IMAGE TONE & SPRITE OUTLINE */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Image Tone & Outline
            </span>
          </div>
        </div>

        {/* Edge / Sprite Outline */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Pixel Sprite Outline</span>
            <span className="text-rose-400 font-bold">{settings.edgeOutline}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={settings.edgeOutline}
            onChange={(e) => onChangeSettings({ edgeOutline: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Contrast</span>
            <span className="text-slate-300 font-bold">{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={settings.contrast}
            onChange={(e) => onChangeSettings({ contrast: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Saturation</span>
            <span className="text-slate-300 font-bold">{settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}</span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            step={10}
            value={settings.saturation}
            onChange={(e) => onChangeSettings({ saturation: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
        </div>

        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Brightness</span>
            <span className="text-slate-300 font-bold">{settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={settings.brightness}
            onChange={(e) => onChangeSettings({ brightness: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
        </div>
      </div>
    </div>
  );
};
