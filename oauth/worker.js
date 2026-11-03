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
      // If GitHub refused the exchange, show the reason instead of closing silently.
      if (!ok) {
        const reason = data.error_description || data.error || 'OAuth exchange failed';
        return new Response(
          `<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:2rem">
           <h2>Échec de connexion</h2><p>GitHub a renvoyé : <b>${reason}</b></p>
           <p>Vérifie le callback de l'app OAuth et les secrets du worker.</p></body>`,
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        );
      }

      const content = `authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}`;

      // Decap handshake: announce "authorizing:github", then hand the token to the
      // opener when it echoes back. Fallbacks (broadcast + delayed) cover Decap
      // builds that validate origins differently.
      const html = `<!doctype html><html><body><script>
        (function () {
          var content = ${JSON.stringify(content)};
          var sent = false;
          function send(target){ try { window.opener && window.opener.postMessage(content, target); } catch (e) {} }
          function receive(e){
            if (!e || !e.data || String(e.data).indexOf('authorizing:github') !== 0) return;
            sent = true;
            send(e.origin);
            window.removeEventListener('message', receive, false);
            setTimeout(function(){ window.close(); }, 300);
          }
          window.addEventListener('message', receive, false);
          send('*');
          window.opener && window.opener.postMessage('authorizing:github', '*');
          setTimeout(function(){ if (!sent) { send('*'); window.close(); } }, 1500);
        })();
      </script>Authentification terminée, vous pouvez fermer cette fenêtre.</body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Decap OAuth proxy. Use /auth to start.', { status: 200 });
  },
};
