import { DitherType, PixelArtSettings, PixelStyle } from '../types';
import { PALETTES } from './palettes';

// Bayer 4x4 Dither Matrix normalized to [-0.5, 0.5]
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
].map(row => row.map(v => (v / 16) - 0.5));

// Bayer 8x8 Dither Matrix normalized to [-0.5, 0.5]
const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map(row => row.map(v => (v / 64) - 0.5));

// Weighted RGB distance for human visual perception
export function colorDistanceSq(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return ((2 + rMean / 256) * dr * dr) + (4 * dg * dg) + ((2 + (255 - rMean) / 256) * db * db);
}

// Find nearest color in palette
export function findNearestColor(
  r: number,
  g: number,
  b: number,
  palette: [number, number, number][]
): [number, number, number] {
  if (palette.length === 0) return [r, g, b];
  let minDistance = Infinity;
  let nearest = palette[0];

  for (let i = 0; i < palette.length; i++) {
    const col = palette[i];
    const dist = colorDistanceSq(r, g, b, col[0], col[1], col[2]);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = col;
      if (dist === 0) break;
    }
  }

  return nearest;
}

// Adjust brightness, contrast, saturation
export function adjustColor(
  r: number,
  g: number,
  b: number,
  brightness: number,
  contrast: number,
  saturation: number
): [number, number, number] {
  // Brightness: -100 to 100 -> add -128 to 128
  let nr = r + (brightness * 1.28);
  let ng = g + (brightness * 1.28);
  let nb = b + (brightness * 1.28);

  // Contrast: -100 to 100 -> factor
  if (contrast !== 0) {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    nr = factor * (nr - 128) + 128;
    ng = factor * (ng - 128) + 128;
    nb = factor * (nb - 128) + 128;
  }

  // Saturation: -100 to 100
  if (saturation !== 0) {
    const gray = 0.2989 * nr + 0.5870 * ng + 0.1140 * nb;
    const satFactor = 1 + (saturation / 100);
    nr = gray + satFactor * (nr - gray);
    ng = gray + satFactor * (ng - gray);
    nb = gray + satFactor * (nb - gray);
  }

  return [
    Math.max(0, Math.min(255, Math.round(nr))),
    Math.max(0, Math.min(255, Math.round(ng))),
    Math.max(0, Math.min(255, Math.round(nb))),
  ];
}

// Extract dominant adaptive palette using Median-Cut quantization
export function extractAdaptivePalette(
  imageData: ImageData,
  colorCount: number
): [number, number, number][] {
  const pixels = imageData.data;
  const sampleColors: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(pixels.length / (4 * 4000))); // sample up to 4000 pixels

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const a = pixels[i + 3];
    if (a > 64) {
      sampleColors.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }
  }

  if (sampleColors.length === 0) {
    return [[0, 0, 0], [255, 255, 255]];
  }

  // Box split for median cut
  interface Box {
    colors: [number, number, number][];
  }

  let boxes: Box[] = [{ colors: sampleColors }];

  while (boxes.length < colorCount) {
    // find box with largest variance/range
    let maxRange = -1;
    let maxBoxIndex = -1;
    let splitChannel = 0;

    for (let i = 0; i < boxes.length; i++) {
      const bColors = boxes[i].colors;
      if (bColors.length <= 1) continue;

      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (let j = 0; j < bColors.length; j++) {
        const c = bColors[j];
        if (c[0] < minR) minR = c[0];
        if (c[0] > maxR) maxR = c[0];
        if (c[1] < minG) minG = c[1];
        if (c[1] > maxG) maxG = c[1];
        if (c[2] < minB) minB = c[2];
        if (c[2] > maxB) maxB = c[2];
      }

      const rRange = maxR - minR;
      const gRange = maxG - minG;
      const bRange = maxB - minB;
      const boxRange = Math.max(rRange, gRange, bRange);

      if (boxRange > maxRange) {
        maxRange = boxRange;
        maxBoxIndex = i;
        splitChannel = rRange >= gRange && rRange >= bRange ? 0 : gRange >= bRange ? 1 : 2;
      }
    }

    if (maxBoxIndex === -1 || maxRange === 0) break;

    const targetBox = boxes[maxBoxIndex];
    targetBox.colors.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const median = Math.floor(targetBox.colors.length / 2);

    const boxA: Box = { colors: targetBox.colors.slice(0, median) };
    const boxB: Box = { colors: targetBox.colors.slice(median) };

    boxes.splice(maxBoxIndex, 1, boxA, boxB);
  }

  return boxes.map(b => {
    let sumR = 0, sumG = 0, sumB = 0;
    for (let j = 0; j < b.colors.length; j++) {
      sumR += b.colors[j][0];
      sumG += b.colors[j][1];
      sumB += b.colors[j][2];
    }
    const count = b.colors.length || 1;
    return [
      Math.round(sumR / count),
      Math.round(sumG / count),
      Math.round(sumB / count),
    ];
  });
}

// Edge detection (Sobel) on low-res grid for comic/sprite pixel outlines
function detectEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number
): boolean[] {
  const edges = new Array(width * height).fill(false);
  if (threshold <= 0) return edges;

  const getLuma = (x: number, y: number) => {
    const clampedX = Math.max(0, Math.min(width - 1, x));
    const clampedY = Math.max(0, Math.min(height - 1, y));
    const idx = (clampedY * width + clampedX) * 4;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  };

  const sens = (100 - threshold) * 2.5 + 20;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -getLuma(x - 1, y - 1) + getLuma(x + 1, y - 1) +
        -2 * getLuma(x - 1, y) + 2 * getLuma(x + 1, y) +
        -getLuma(x - 1, y + 1) + getLuma(x + 1, y + 1);

      const gy =
        -getLuma(x - 1, y - 1) - 2 * getLuma(x, y - 1) - getLuma(x + 1, y - 1) +
        getLuma(x - 1, y + 1) + 2 * getLuma(x, y + 1) + getLuma(x + 1, y + 1);

      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag > sens) {
        edges[y * width + x] = true;
      }
    }
  }

  return edges;
}

export interface RenderResult {
  pixelCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  paletteColorsUsed: [number, number, number][];
}

/**
 * Main Pixel Art Generation Engine:
 * Downscales source image to low-res grid based on `quality` slider,
 * applies color tone adjustments, edge detection, dithering, and palette quantization.
 */
export function processPixelArt(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  settings: PixelArtSettings,
  adaptivePaletteCache?: [number, number, number][]
): RenderResult {
  const origW = sourceImage.width;
  const origH = sourceImage.height;

  // Calculate pixel resolution grid
  // Quality represents width in pixel blocks (8px to 320px)
  let targetW = Math.max(8, Math.min(320, Math.round(settings.quality)));
  let targetH = Math.max(8, Math.round((targetW / origW) * origH));

  // Create downscaled intermediate canvas
  const downCanvas = document.createElement('canvas');
  downCanvas.width = targetW;
  downCanvas.height = targetH;
  const downCtx = downCanvas.getContext('2d', { willReadFrequently: true });
  if (!downCtx) throw new Error('Could not get 2d context');

  // Use crisp downscale
  downCtx.imageSmoothingEnabled = true;
  downCtx.imageSmoothingQuality = 'medium';
  downCtx.drawImage(sourceImage, 0, 0, targetW, targetH);

  const imgData = downCtx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // Determine active palette
  let activePalette: [number, number, number][] = [];
  const selectedPal = PALETTES.find(p => p.id === settings.paletteId);

  if (settings.paletteId === 'adaptive') {
    if (adaptivePaletteCache && adaptivePaletteCache.length === settings.adaptiveColorCount) {
      activePalette = adaptivePaletteCache;
    } else {
      activePalette = extractAdaptivePalette(imgData, settings.adaptiveColorCount);
    }
  } else if (selectedPal && selectedPal.colors.length > 0) {
    activePalette = selectedPal.colors;
  }

  // Edge outline calculation if enabled
  const edges = settings.edgeOutline > 0
    ? detectEdges(data, targetW, targetH, settings.edgeOutline)
    : [];

  const isFloyd = settings.ditherType === 'floyd-steinberg' && activePalette.length > 0;
  const isBayer4 = settings.ditherType === 'bayer4' && activePalette.length > 0;
  const isBayer8 = settings.ditherType === 'bayer8' && activePalette.length > 0;
  const ditherSpread = settings.ditherAmount * 48; // scale of dither bias

  // Working float buffers for error diffusion if Floyd-Steinberg is used
  let fErrorsR: Float32Array | null = null;
  let fErrorsG: Float32Array | null = null;
  let fErrorsB: Float32Array | null = null;

  if (isFloyd) {
    // 2 rows of error buffers (current and next row)
    fErrorsR = new Float32Array((targetW + 2) * 2);
    fErrorsG = new Float32Array((targetW + 2) * 2);
    fErrorsB = new Float32Array((targetW + 2) * 2);
  }

  const colorsUsedMap = new Map<string, [number, number, number]>();

  // Process pixels
  for (let y = 0; y < targetH; y++) {
    const curErrRow = (y % 2) * (targetW + 2);
    const nextErrRow = ((y + 1) % 2) * (targetW + 2);

    // Clear next error row
    if (isFloyd && fErrorsR && fErrorsG && fErrorsB) {
      for (let x = 0; x < targetW + 2; x++) {
        fErrorsR[nextErrRow + x] = 0;
        fErrorsG[nextErrRow + x] = 0;
        fErrorsB[nextErrRow + x] = 0;
      }
    }

    for (let x = 0; x < targetW; x++) {
      const idx = (y * targetW + x) * 4;
      const alpha = data[idx + 3];

      // If fully transparent, leave transparent
      if (alpha < 16) {
        data[idx + 3] = 0;
        continue;
      }

      // 1. Color tone adjustments
      let [r, g, b] = adjustColor(
        data[idx],
        data[idx + 1],
        data[idx + 2],
        settings.brightness,
        settings.contrast,
        settings.saturation
      );

      // 2. Check edge outline
      if (settings.edgeOutline > 0 && edges[y * targetW + x]) {
        // Outline pixel
        r = Math.max(0, Math.round(r * 0.2));
        g = Math.max(0, Math.round(g * 0.2));
        b = Math.max(0, Math.round(b * 0.2));
      } else {
        // 3. Dithering
        if (isFloyd && fErrorsR && fErrorsG && fErrorsB) {
          const errIdx = curErrRow + x + 1;
          r = Math.max(0, Math.min(255, r + fErrorsR[errIdx] * settings.ditherAmount));
          g = Math.max(0, Math.min(255, g + fErrorsG[errIdx] * settings.ditherAmount));
          b = Math.max(0, Math.min(255, b + fErrorsB[errIdx] * settings.ditherAmount));
        } else if (isBayer4) {
          const ditherVal = BAYER_4X4[y % 4][x % 4] * ditherSpread;
          r = Math.max(0, Math.min(255, r + ditherVal));
          g = Math.max(0, Math.min(255, g + ditherVal));
          b = Math.max(0, Math.min(255, b + ditherVal));
        } else if (isBayer8) {
          const ditherVal = BAYER_8X8[y % 8][x % 8] * ditherSpread;
          r = Math.max(0, Math.min(255, r + ditherVal));
          g = Math.max(0, Math.min(255, g + ditherVal));
          b = Math.max(0, Math.min(255, b + ditherVal));
        }
      }

      // 4. Palette quantization
      let outR = r;
      let outG = g;
      let outB = b;

      if (activePalette.length > 0) {
        const match = findNearestColor(r, g, b, activePalette);
        outR = match[0];
        outG = match[1];
        outB = match[2];

        // Floyd-Steinberg error distribution
        if (isFloyd && fErrorsR && fErrorsG && fErrorsB) {
          const errR = r - outR;
          const errG = g - outG;
          const errB = b - outB;

          const eX = x + 1;
          // (x + 1, y) += 7/16
          fErrorsR[curErrRow + eX + 1] += errR * (7 / 16);
          fErrorsG[curErrRow + eX + 1] += errG * (7 / 16);
          fErrorsB[curErrRow + eX + 1] += errB * (7 / 16);

          // (x - 1, y + 1) += 3/16
          fErrorsR[nextErrRow + eX - 1] += errR * (3 / 16);
          fErrorsG[nextErrRow + eX - 1] += errG * (3 / 16);
          fErrorsB[nextErrRow + eX - 1] += errB * (3 / 16);

          // (x, y + 1) += 5/16
          fErrorsR[nextErrRow + eX] += errR * (5 / 16);
          fErrorsG[nextErrRow + eX] += errG * (5 / 16);
          fErrorsB[nextErrRow + eX] += errB * (5 / 16);

          // (x + 1, y + 1) += 1/16
          fErrorsR[nextErrRow + eX + 1] += errR * (1 / 16);
          fErrorsG[nextErrRow + eX + 1] += errG * (1 / 16);
          fErrorsB[nextErrRow + eX + 1] += errB * (1 / 16);
        }
      }

      data[idx] = outR;
      data[idx + 1] = outG;
      data[idx + 2] = outB;
      data[idx + 3] = 255;

      const key = `${outR},${outG},${outB}`;
      if (!colorsUsedMap.has(key)) {
        colorsUsedMap.set(key, [outR, outG, outB]);
      }
    }
  }

  // Put processed low-res pixel data back
  downCtx.putImageData(imgData, 0, 0);

  return {
    pixelCanvas: downCanvas,
    width: targetW,
    height: targetH,
    paletteColorsUsed: Array.from(colorsUsedMap.values()),
  };
}

/**
 * Draws the low-res pixel canvas onto a display canvas with authentic scaling
 * and optional pixel style shaders (Scanlines, CRT phosphor, Rounded beads, etc.)
 */
export function drawPixelToDisplay(
  pixelCanvas: HTMLCanvasElement,
  displayCanvas: HTMLCanvasElement,
  scale: number,
  style: PixelStyle,
  showGrid: boolean = false
): void {
  const pixelW = pixelCanvas.width;
  const pixelH = pixelCanvas.height;

  const targetW = pixelW * scale;
  const targetH = pixelH * scale;

  displayCanvas.width = targetW;
  displayCanvas.height = targetH;

  const ctx = displayCanvas.getContext('2d');
  if (!ctx) return;

  // Crucial: Nearest-neighbor interpolation ensures crisp pixel art
  ctx.imageSmoothingEnabled = false;

  if (style === 'square') {
    ctx.drawImage(pixelCanvas, 0, 0, targetW, targetH);
  } else if (style === 'dots') {
    // Bead/rounded mosaic style
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, targetW, targetH);

    const pCtx = pixelCanvas.getContext('2d');
    if (!pCtx) return;
    const imgData = pCtx.getImageData(0, 0, pixelW, pixelH);
    const data = imgData.data;
    const radius = Math.max(1, (scale / 2) * 0.88);

    for (let py = 0; py < pixelH; py++) {
      for (let px = 0; px < pixelW; px++) {
        const idx = (py * pixelW + px) * 4;
        if (data[idx + 3] < 16) continue;
        ctx.fillStyle = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
        ctx.beginPath();
        const cx = px * scale + scale / 2;
        const cy = py * scale + scale / 2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (style === 'scanlines') {
    ctx.drawImage(pixelCanvas, 0, 0, targetW, targetH);
    // Darken alternate scanline rows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    const scanlineStep = Math.max(2, Math.round(scale));
    for (let y = 0; y < targetH; y += scanlineStep) {
      ctx.fillRect(0, y, targetW, Math.max(1, Math.floor(scanlineStep / 2)));
    }
  } else if (style === 'crt') {
    // CRT aperture grill & subtle vignette
    ctx.drawImage(pixelCanvas, 0, 0, targetW, targetH);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < targetH; y += 2) {
      ctx.fillRect(0, y, targetW, 1);
    }

    // Vignette
    const gradient = ctx.createRadialGradient(
      targetW / 2, targetH / 2, Math.min(targetW, targetH) * 0.4,
      targetW / 2, targetH / 2, Math.max(targetW, targetH) * 0.75
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, targetW, targetH);
  } else if (style === 'mosaic') {
    // Cross-stitch / beveled tile mosaic
    const pCtx = pixelCanvas.getContext('2d');
    if (!pCtx) return;
    const imgData = pCtx.getImageData(0, 0, pixelW, pixelH);
    const data = imgData.data;

    for (let py = 0; py < pixelH; py++) {
      for (let px = 0; px < pixelW; px++) {
        const idx = (py * pixelW + px) * 4;
        if (data[idx + 3] < 16) continue;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const x = px * scale;
        const y = py * scale;

        // Base fill
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x + 1, y + 1, scale - 1, scale - 1);

        if (scale >= 4) {
          // Subtle top/left highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(x + 1, y + 1, scale - 1, 1);
          ctx.fillRect(x + 1, y + 1, 1, scale - 1);

          // Subtle bottom/right shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(x + 1, y + scale - 1, scale - 1, 1);
          ctx.fillRect(x + scale - 1, y + 1, 1, scale - 1);
        }
      }
    }
  }

  // Draw pixel grid overlay if enabled and scale is large enough
  if (showGrid && scale >= 4) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = 0; x <= pixelW; x++) {
      ctx.moveTo(x * scale + 0.5, 0);
      ctx.lineTo(x * scale + 0.5, targetH);
    }
    for (let y = 0; y <= pixelH; y++) {
      ctx.moveTo(0, y * scale + 0.5);
      ctx.lineTo(targetW, y * scale + 0.5);
    }
    ctx.stroke();
  }
}
