export type DitherType = 'none' | 'floyd-steinberg' | 'bayer4' | 'bayer8';

export type PixelStyle = 'square' | 'scanlines' | 'crt' | 'dots' | 'mosaic';

export type ViewMode = 'pixel' | 'split' | 'side-by-side' | 'original';

export type DetachMode = 'none' | 'window' | 'floating';

export interface Palette {
  id: string;
  name: string;
  category: 'retro' | 'classic' | 'stylized' | 'custom' | 'adaptive';
  description: string;
  colors: [number, number, number][]; // RGB values [0..255]
}

export interface PixelArtSettings {
  quality: number; // 8 to 320 pixels wide (primary scale)
  paletteId: string;
  adaptiveColorCount: number; // 2 to 64 colors if adaptive
  ditherType: DitherType;
  ditherAmount: number; // 0.0 to 1.0
  pixelStyle: PixelStyle;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  edgeOutline: number; // 0 (off) to 100
  edgeColor: 'dark' | 'black' | 'palette-dark';
  maintainAspectRatio: boolean;
  pixelGrid: boolean;
}

export interface ImageDimensions {
  originalWidth: number;
  originalHeight: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface SampleImage {
  id: string;
  name: string;
  category: string;
  url: string;
}

export interface AnimationFrame {
  id: string;
  name: string;
  sourceImageUrl: string;
  sourceImageElement: HTMLImageElement;
  settings: PixelArtSettings;
  pixelCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  paletteColorsUsed: [number, number, number][];
}

export interface SampleAnimationPreset {
  id: string;
  name: string;
  category: string;
  fps: number;
  frames: { name: string; url: string }[];
}

