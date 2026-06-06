// Thin wrapper around Plausible's custom events API.
// Falls back silently if Plausible isn't loaded (dev, ad blockers).
declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string | number> }) => void;
  }
}

export function track(event: string, props?: Record<string, string | number>) {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch { /* silent */ }
}
