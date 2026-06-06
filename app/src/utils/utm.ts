interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// Read UTMs from the current URL, falling back to sessionStorage so they
// survive the assessment flow (user lands → clicks start → finishes → submits).
export function getUtmParams(): UtmParams {
  const params = new URLSearchParams(window.location.search);
  const stored = getStoredUtm();

  const live: UtmParams = {};
  if (params.get('utm_source')) live.utm_source = params.get('utm_source')!;
  if (params.get('utm_medium')) live.utm_medium = params.get('utm_medium')!;
  if (params.get('utm_campaign')) live.utm_campaign = params.get('utm_campaign')!;
  if (params.get('utm_content')) live.utm_content = params.get('utm_content')!;
  if (params.get('utm_term')) live.utm_term = params.get('utm_term')!;

  const merged = { ...stored, ...live };

  if (Object.keys(live).length > 0) {
    storeUtm(merged);
  }

  return merged;
}

function storeUtm(utm: UtmParams) {
  try {
    sessionStorage.setItem('__utm', JSON.stringify(utm));
  } catch { /* incognito or storage full */ }
}

function getStoredUtm(): UtmParams {
  try {
    const raw = sessionStorage.getItem('__utm');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
