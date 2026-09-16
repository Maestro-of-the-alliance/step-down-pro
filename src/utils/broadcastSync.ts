import { PixelArtSettings, ViewMode } from '../types';

export const BROADCAST_CHANNEL_NAME = 'pixel_art_studio_broadcast_channel';
export const STORAGE_BACKUP_KEY = 'pixel_art_studio_sync_backup';

export interface StudioSyncPayload {
  settings: PixelArtSettings;
  viewMode: ViewMode;
  paletteName: string;
  paletteColors: [number, number, number][];
  activeFrameIndex: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  onionSkin: boolean;
  sourceImageUrl: string | null;
  renderedPixelDataUrl: string | null;
  onionSkinDataUrl: string | null;
  dimensions: { width: number; height: number };
  timestamp: number;
}

export type BroadcastMessage =
  | { type: 'STUDIO_STATE_UPDATE'; payload: StudioSyncPayload }
  | { type: 'REQUEST_SYNC' }
  | { type: 'HEARTBEAT'; timestamp: number }
  | { type: 'STUDIO_DISCONNECT' };

/**
 * Helper to safely broadcast a message across BroadcastChannel and fallback to localStorage.
 */
export function sendBroadcastMessage(channel: BroadcastChannel | null, message: BroadcastMessage) {
  if (channel) {
    try {
      channel.postMessage(message);
    } catch (e) {
      console.warn('BroadcastChannel postMessage error:', e);
    }
  }

  // Backup sync via localStorage for older browsers or restricted contexts
  try {
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify({
      message,
      t: Date.now(),
    }));
  } catch (e) {
    // Ignore quota or private mode storage restrictions
  }
}
