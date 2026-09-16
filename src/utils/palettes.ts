import { Palette } from '../types';

export const PALETTES: Palette[] = [
  {
    id: 'original',
    name: 'Original Colors',
    category: 'classic',
    description: 'Direct high-fidelity pixelation without color reduction',
    colors: [], // empty means use original downscaled colors
  },
  {
    id: 'pico8',
    name: 'PICO-8 (16)',
    category: 'retro',
    description: 'Iconic 16-color fantasy console palette',
    colors: [
      [0, 0, 0],
      [29, 43, 83],
      [126, 37, 83],
      [0, 135, 81],
      [171, 82, 54],
      [95, 87, 79],
      [194, 195, 199],
      [255, 241, 232],
      [255, 0, 77],
      [255, 163, 0],
      [255, 236, 39],
      [0, 228, 54],
      [41, 173, 255],
      [131, 118, 156],
      [255, 119, 168],
      [255, 204, 170],
    ],
  },
  {
    id: 'gameboy',
    name: 'Game Boy DMG-01 (4)',
    category: 'retro',
    description: 'Classic 1989 monochrome 4-shade greenish pea soup',
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  {
    id: 'sweetie16',
    name: 'Sweetie 16',
    category: 'stylized',
    description: 'Vibrant, balanced modern pixel art palette by GrafxKid',
    colors: [
      [26, 28, 44],
      [93, 39, 93],
      [177, 62, 83],
      [239, 125, 87],
      [255, 205, 117],
      [167, 240, 112],
      [56, 183, 100],
      [37, 113, 121],
      [41, 54, 111],
      [59, 93, 201],
      [65, 166, 246],
      [115, 239, 247],
      [244, 244, 244],
      [148, 176, 194],
      [86, 108, 134],
      [51, 60, 87],
    ],
  },
  {
    id: 'endesga32',
    name: 'EDG 32',
    category: 'stylized',
    description: 'Rich, versatile 32-color palette crafted by Endesga',
    colors: [
      [190, 74, 47],
      [215, 118, 67],
      [234, 212, 170],
      [228, 166, 114],
      [184, 111, 80],
      [115, 62, 57],
      [62, 39, 49],
      [162, 38, 51],
      [228, 59, 68],
      [247, 118, 34],
      [254, 174, 52],
      [254, 231, 97],
      [99, 199, 77],
      [62, 137, 72],
      [38, 92, 66],
      [25, 60, 62],
      [18, 78, 137],
      [0, 153, 219],
      [44, 232, 244],
      [254, 255, 255],
      [192, 203, 220],
      [139, 155, 180],
      [90, 105, 136],
      [58, 68, 102],
      [38, 43, 68],
      [24, 20, 37],
      [255, 0, 68],
      [255, 110, 89],
      [255, 157, 129],
      [255, 210, 170],
      [104, 56, 108],
      [181, 80, 136],
    ],
  },
  {
    id: 'c64',
    name: 'Commodore 64 (16)',
    category: 'retro',
    description: 'Warm, muted 80s home computer palette',
    colors: [
      [0, 0, 0],
      [255, 255, 255],
      [136, 0, 0],
      [170, 255, 238],
      [204, 68, 204],
      [0, 204, 85],
      [0, 0, 170],
      [238, 238, 119],
      [221, 136, 85],
      [102, 68, 0],
      [255, 119, 119],
      [51, 51, 51],
      [119, 119, 119],
      [170, 255, 102],
      [0, 136, 255],
      [187, 187, 187],
    ],
  },
  {
    id: 'cga',
    name: 'CGA Mode 1 (4)',
    category: 'retro',
    description: 'Authentic 1981 IBM PC high intensity cyan/magenta',
    colors: [
      [0, 0, 0],
      [85, 255, 255],
      [255, 85, 255],
      [255, 255, 255],
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Synthwave Neon (12)',
    category: 'stylized',
    description: 'Electric violet, hot magenta, cyan, and deep midnight',
    colors: [
      [13, 2, 33],
      [37, 19, 81],
      [71, 26, 107],
      [114, 9, 183],
      [181, 23, 158],
      [247, 37, 133],
      [76, 201, 240],
      [72, 149, 239],
      [67, 97, 238],
      [63, 55, 201],
      [0, 245, 212],
      [255, 255, 255],
    ],
  },
  {
    id: 'monochrome',
    name: '1-Bit Mac (2)',
    category: 'retro',
    description: 'Pure stark black & white for dramatic dithering',
    colors: [
      [0, 0, 0],
      [255, 255, 255],
    ],
  },
  {
    id: 'gameboy-pocket',
    name: 'GB Pocket Grayscale (4)',
    category: 'retro',
    description: 'Crisp 4-level neutral grayscale',
    colors: [
      [24, 24, 24],
      [90, 90, 90],
      [170, 170, 170],
      [245, 245, 245],
    ],
  },
  {
    id: 'adaptive',
    name: 'Adaptive Image Palette',
    category: 'adaptive',
    description: 'Extracts the most dominant aesthetic colors directly from your photo',
    colors: [], // Generated dynamically via median-cut / k-means
  },
];

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}
