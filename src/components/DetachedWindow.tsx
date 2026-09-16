import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DetachedWindowProps {
  children: React.ReactNode;
  onClose: () => void;
  onBlocked?: () => void;
}

export const DetachedWindow: React.FC<DetachedWindowProps> = ({
  children,
  onClose,
  onBlocked,
}) => {
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);
  const [isReady, setIsReady] = useState(false);
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    // 1. Attempt to open a popup window
    let win: Window | null = null;
    try {
      win = window.open(
        '',
        'PixelArtDetachedPreview',
        'width=1024,height=800,left=150,top=100,resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no'
      );
    } catch (err) {
      console.warn('Detached window blocked or failed:', err);
    }

    if (!win || win.closed || typeof win.closed === 'undefined') {
      if (onBlocked) onBlocked();
      return;
    }

    windowRef.current = win;
    setPopoutWindow(win);

    // 2. Setup document in new window
    win.document.title = 'Pixel Art Studio - Detached Live Preview';

    // Copy viewport meta tag
    const metaViewport = win.document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1.0';
    win.document.head.appendChild(metaViewport);

    // Copy all style tags and link stylesheets from current document
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach((styleTag) => {
      win!.document.head.appendChild(styleTag.cloneNode(true));
    });

    win.document.body.className = 'bg-slate-950 text-slate-100 m-0 p-0 overflow-hidden select-none';

    // Handle when user closes the window manually via OS window buttons
    const handleUnload = () => {
      onClose();
    };

    win.addEventListener('beforeunload', handleUnload);
    win.addEventListener('unload', handleUnload);

    setIsReady(true);

    return () => {
      win?.removeEventListener('beforeunload', handleUnload);
      win?.removeEventListener('unload', handleUnload);
      if (win && !win.closed) {
        win.close();
      }
    };
  }, [onClose, onBlocked]);

  if (!popoutWindow || !isReady || !popoutWindow.document?.body) {
    return null;
  }

  return createPortal(children, popoutWindow.document.body);
};
