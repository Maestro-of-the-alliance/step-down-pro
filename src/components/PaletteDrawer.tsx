import React, { useState } from 'react';
import { Palette, Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { rgbToHex } from '../utils/palettes';

interface PaletteDrawerProps {
  colors: [number, number, number][];
  paletteName: string;
}

export const PaletteDrawer: React.FC<PaletteDrawerProps> = ({
  colors,
  paletteName,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  if (colors.length === 0) return null;

  return (
    <div className="mt-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Active Colors in Pixel Art ({colors.length})
          </span>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Click any color to copy HEX
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isExpanded ? 'Collapse' : 'Show All'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Swatch ribbon / grid */}
      <div
        className={`mt-2 flex flex-wrap gap-1.5 transition-all ${
          isExpanded ? 'max-h-64 overflow-y-auto' : 'max-h-12 overflow-hidden'
        }`}
      >
        {colors.map(([r, g, b], i) => {
          const hex = rgbToHex(r, g, b);
          const isCopied = copiedHex === hex;
          return (
            <button
              key={`${hex}-${i}`}
              type="button"
              onClick={() => handleCopy(hex)}
              title={`${hex.toUpperCase()} (Click to copy)`}
              className="relative group w-8 h-8 rounded-lg border border-white/10 overflow-hidden shadow-xs hover:scale-110 hover:z-10 transition-transform cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: hex }}
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
              ) : (
                <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-bold">
                  #
                </span>
              )}
            </button>
          );
        })}
      </div>

      {copiedHex && (
        <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Copied {copiedHex.toUpperCase()} to clipboard!</span>
        </div>
      )}
    </div>
  );
};
