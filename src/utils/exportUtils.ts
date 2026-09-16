import { rgbToHex } from './palettes';
import { AnimationFrame } from '../types';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

/**
 * Creates a high-res crisp PNG from a low-res pixel canvas
 */
export function createCrispImageBlob(
  pixelCanvas: HTMLCanvasElement,
  scale: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = pixelCanvas.width * scale;
    exportCanvas.height = pixelCanvas.height * scale;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    // Absolutely crisp nearest-neighbor interpolation
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

    exportCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate PNG blob'));
      }
    }, 'image/png');
  });
}

/**
 * Downloads a canvas or blob as a PNG file
 */
export async function downloadPixelArt(
  pixelCanvas: HTMLCanvasElement,
  scale: number,
  filename: string = 'pixel-art'
): Promise<void> {
  const blob = await createCrispImageBlob(pixelCanvas, scale);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${pixelCanvas.width}x${pixelCanvas.height}@${scale}x.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Copies the crisp scaled image directly to the system clipboard
 */
export async function copyPixelArtToClipboard(
  pixelCanvas: HTMLCanvasElement,
  scale: number = 4
): Promise<boolean> {
  try {
    const blob = await createCrispImageBlob(pixelCanvas, scale);
    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Generates and downloads a palette swatch card
 */
export function downloadPaletteImage(
  colors: [number, number, number][],
  paletteName: string = 'palette'
): void {
  if (colors.length === 0) return;

  const cols = Math.min(8, colors.length);
  const rows = Math.ceil(colors.length / cols);
  const swatchSize = 80;
  const padding = 20;
  const labelHeight = 30;

  const canvas = document.createElement('canvas');
  canvas.width = cols * swatchSize + padding * 2;
  canvas.height = rows * (swatchSize + labelHeight) + padding * 2 + 40;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`PALETTE: ${paletteName.toUpperCase()} (${colors.length} COLORS)`, padding, padding + 15);

  for (let i = 0; i < colors.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * swatchSize;
    const y = padding + 40 + row * (swatchSize + labelHeight);

    const [r, g, b] = colors[i];
    const hex = rgbToHex(r, g, b);

    // Swatch box
    ctx.fillStyle = hex;
    ctx.fillRect(x + 4, y + 4, swatchSize - 8, swatchSize - 8);

    // Swatch border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, swatchSize - 8, swatchSize - 8);

    // Label
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hex.toUpperCase(), x + swatchSize / 2, y + swatchSize + 14);
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paletteName}-palette.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, 'image/png');
}

/**
 * Encodes all frames into a crisp looping animated GIF using gifenc
 */
export async function downloadAnimatedGif(
  frames: AnimationFrame[],
  fps: number,
  scale: number = 4,
  filename: string = 'pixel-animation'
): Promise<void> {
  if (frames.length === 0) return;

  const firstFrame = frames[0];
  const targetWidth = firstFrame.width * scale;
  const targetHeight = firstFrame.height * scale;

  const gif = GIFEncoder();
  const delayMs = Math.max(10, Math.round(1000 / Math.max(1, fps)));

  const scratchCanvas = document.createElement('canvas');
  scratchCanvas.width = targetWidth;
  scratchCanvas.height = targetHeight;
  const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas 2d context for GIF export');

  ctx.imageSmoothingEnabled = false;

  for (const frame of frames) {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(frame.pixelCanvas, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const rgba = imageData.data;

    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);

    gif.writeFrame(index, targetWidth, targetHeight, {
      palette,
      delay: delayMs,
      repeat: 0, // infinite loop
    });
  }

  gif.finish();
  const bytes = gif.bytes();
  const blob = new Blob([bytes], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${targetWidth}x${targetHeight}@${fps}fps.gif`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Downloads a crisp spritesheet containing all frames
 */
export function downloadSpriteSheet(
  frames: AnimationFrame[],
  scale: number = 2,
  layout: 'horizontal' | 'grid' = 'horizontal',
  filename: string = 'pixel-spritesheet'
): void {
  if (frames.length === 0) return;
  const fWidth = frames[0].width * scale;
  const fHeight = frames[0].height * scale;

  const cols = layout === 'horizontal' ? frames.length : Math.ceil(Math.sqrt(frames.length));
  const rows = layout === 'horizontal' ? 1 : Math.ceil(frames.length / cols);

  const canvas = document.createElement('canvas');
  canvas.width = cols * fWidth;
  canvas.height = rows * fHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = false;

  frames.forEach((frame, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.drawImage(frame.pixelCanvas, col * fWidth, row * fHeight, fWidth, fHeight);
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${canvas.width}x${canvas.height}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, 'image/png');
}

