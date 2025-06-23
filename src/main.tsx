

// ENHANCED ANTI-TRACKING & ANTI-FINGERPRINTING SCRIPT
(function() {
  // Block geolocation
  if (navigator.geolocation) {
    (navigator.geolocation as any).getCurrentPosition = function() {
      return Promise.reject(new Error('Geolocation blocked'));
    };
    (navigator.geolocation as any).watchPosition = function() {
      return Promise.reject(new Error('Geolocation blocked'));
    };
  }
  // Spoof and randomize navigator and window properties
  function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randomFloat(min: number, max: number) { return Math.random() * (max - min) + min; }
  try {
    Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', configurable: true });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32', configurable: true });
    Object.defineProperty(navigator, 'language', { get: () => 'en-US', configurable: true });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'], configurable: true });
    Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.', configurable: true });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => randomInt(4, 16), configurable: true });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => randomInt(2, 16), configurable: true });
    Object.defineProperty(window.screen, 'width', { get: () => randomInt(1200, 1920), configurable: true });
    Object.defineProperty(window.screen, 'height', { get: () => randomInt(700, 1080), configurable: true });
    Object.defineProperty(window.screen, 'colorDepth', { get: () => randomInt(24, 32), configurable: true });
    Object.defineProperty(window.screen, 'pixelDepth', { get: () => randomInt(24, 32), configurable: true });
  } catch (e) {}
  // Block timezone leaks
  try {
    const fakeTZ = 'UTC';
    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    (Intl as any).DateTimeFormat = function(...args: any[]) {
      const dtf = new OriginalDateTimeFormat(...args);
      const originalResolvedOptions = dtf.resolvedOptions;
      dtf.resolvedOptions = () => ({ ...originalResolvedOptions.call(dtf), timeZone: fakeTZ });
      return dtf;
    };
    (Intl.DateTimeFormat as any).supportedLocalesOf = OriginalDateTimeFormat.supportedLocalesOf;
  } catch (e) {}
  // Block window.location access
  try {
    Object.defineProperty(window, 'location', { get: () => ({ href: '', protocol: '', host: '', hostname: '', port: '', pathname: '', search: '', hash: '' }), configurable: true });
  } catch (e) {}
  // Canvas and WebGL fingerprinting noise
  function addCanvasNoise(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noise = Math.floor(Math.random() * 10);
        const pixel = ctx.getImageData(x, y, 1, 1);
        pixel.data[0] = (pixel.data[0] + noise) % 256;
        pixel.data[1] = (pixel.data[1] + noise) % 256;
        pixel.data[2] = (pixel.data[2] + noise) % 256;
        ctx.putImageData(pixel, x, y);
      }
    }
  }
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type: string, ...args: any[]) {
    const ctx = origGetContext.apply(this, [type, ...args]);
    if (type === '2d' && ctx) {
      const canvas = ctx.canvas;
      const origToDataURL = canvas.toDataURL;
      canvas.toDataURL = function(...a: any[]) {
        addCanvasNoise(ctx as CanvasRenderingContext2D);
        return origToDataURL.apply(this, a);
      };
    }
    return ctx;
  };
  // Block third-party script injection
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if ((node as Element).tagName === 'SCRIPT' && (node as HTMLScriptElement).src && !(node as HTMLScriptElement).src.includes(window.location.host)) {
          node.parentNode && node.parentNode.removeChild(node);
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

