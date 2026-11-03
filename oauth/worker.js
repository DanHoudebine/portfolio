/**
 * Minimal GitHub OAuth proxy for Decap CMS, as a Cloudflare Worker.
 *
 * Decap's GitHub backend needs a server to exchange the OAuth `code` for a
 * token (the client secret must stay off the browser). This Worker does only
 * that. Deploy it, then set public/admin/config.yml `backend.base_url` to this
 * Worker's URL.
 *
 * Required Worker secrets (wrangler secret put / dashboard → Settings → Variables):
 *   GITHUB_CLIENT_ID      — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET  — from your GitHub OAuth App
 *
 * GitHub OAuth App settings:
 *   Homepage URL:               https://danhoudebine.com
 *   Authorization callback URL: https://<this-worker-url>/callback
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Step 1 — Decap opens /auth → redirect the user to GitHub's consent screen.
    if (url.pathname === '/auth') {
      const redirectUri = `${url.origin}/callback`;
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      gh.searchParams.set('redirect_uri', redirectUri);
      gh.searchParams.set('scope', url.searchParams.get('scope') || 'repo');
      gh.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(gh.toString(), 302);
    }

    // Step 2 — GitHub redirects back to /callback?code=… → swap code for a token.
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();

      const ok = Boolean(data.access_token);
      const payload = ok
        ? { token: data.access_token, provider: 'github' }
        : { error: data.error_description || 'OAuth failed' };
      const content = `authorization:github:${ok ? 'success' : 'error'}:${JSON.stringify(payload)}`;

      // Decap handshake: announce "authorizing:github", wait for the opener's
      // reply, THEN send the token back to its origin. Sending too early (before
      // the handshake) makes Decap ignore the token and stay on the login screen.
      const html = `<!doctype html><html><body><script>
        (function () {
          var content = ${JSON.stringify(content)};
          function receive(e) {
            if (!e || !e.data || String(e.data).indexOf('authorizing:github') !== 0) return;
            window.opener.postMessage(content, e.origin);
            window.removeEventListener('message', receive, false);
            setTimeout(function(){ window.close(); }, 300);
          }
          window.addEventListener('message', receive, false);
          window.opener && window.opener.postMessage('authorizing:github', '*');
        })();
      </script>Authentification terminée, vous pouvez fermer cette fenêtre.</body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Decap OAuth proxy. Use /auth to start.', { status: 200 });
  },
};
