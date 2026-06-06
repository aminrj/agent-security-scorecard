// Cloudflare Pages Function — proxies Beehiiv subscription so the API key
// never ships to the browser.
//
// Set these secrets in the Cloudflare Pages dashboard → Settings → Environment variables:
//   BEEHIIV_API_KEY          (secret)
//   BEEHIIV_PUBLICATION_ID   (plain text, e.g. pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

interface Env {
  BEEHIIV_API_KEY: string;
  BEEHIIV_PUBLICATION_ID: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID } = env;

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    return new Response(JSON.stringify({ error: 'Beehiiv not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let body: { email: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const { email, utm_source, utm_medium, utm_campaign } = body;

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: utm_source ?? 'agent-security-scorecard',
        utm_medium: utm_medium ?? 'assessment',
        utm_campaign: utm_campaign ?? 'organic',
      }),
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.ok ? 200 : res.status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
};
