# Nginx cache + service-worker hygiene (kids.usamif.com)

> Permanent fix for the "new build deployed but browser still shows old UI"
> class of defect. Investigated 2026-10-01: there is **NO service worker** in
> USAM (verified — none in any frontend tree, root `src/`, or git history; the
> build output is only `index.html` + hashed `/assets/*`). The `200` on `/sw.js`
> was nginx's SPA `try_files … /index.html` fallback returning the HTML shell,
> NOT a real worker. The real risk is simply that `index.html` can be cached by
> the browser, so a returning visitor keeps the old shell (which references the
> old hashed JS) even after a correct deploy.

## The policy

1. **`index.html` must be revalidated every load** (`Cache-Control: no-cache`).
   It is tiny (~1.5 kB) and references the current hashed bundle, so this
   guarantees every visitor — new OR returning, no DevTools/incognito needed —
   fetches the newest app on the next navigation.
2. **`/assets/*` (content-hashed) cache immutably** (`max-age=31536000, immutable`).
   Safe because the filename changes on every build.
3. **`/sw.js` and `/service-worker.js` return `404`** — never fall through to the
   SPA shell. USAM ships no worker; these paths must be unambiguous so no browser
   can ever treat a stale HTML-as-JS response as a service worker.

## The server block (apply inside the `server { }` for kids.usamif.com)

Assuming `root /home/ubuntu/USAM-Learning-Worlds/frontend/dist;` (the directory
`scripts/deploy.sh` builds):

```nginx
    # 1. Service-worker URLs are retired — USAM has no PWA worker. Return 404
    #    instead of letting them fall through to index.html (ambiguous 200).
    location = /sw.js            { return 404; }
    location = /service-worker.js { return 404; }

    # 2. Hashed build assets: immutable, cache forever (filename changes per build).
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # 3. index.html / SPA shell: never cache the shell, always revalidate, so a
    #    new deploy is picked up immediately with no manual cache clearing.
    location = / {
        add_header Cache-Control "no-cache, must-revalidate";
        try_files /index.html =404;
    }

    # 4. SPA fallback for client routes — also no-cache (they all serve the shell).
    location / {
        add_header Cache-Control "no-cache, must-revalidate";
        try_files $uri $uri/ /index.html;
    }

    # 5. API proxy (unchanged — keep your existing /api/ block above these).
```

Order matters: the two `location = /sw.js` / `= /service-worker.js` exact matches
and the `/assets/` prefix must come BEFORE the catch-all `location /`.

## Apply + verify (server)

```bash
sudo nano /etc/nginx/sites-available/usam     # add the blocks above
sudo nginx -t                                  # MUST pass before reload
sudo systemctl reload nginx
# verify from the public domain:
bash scripts/verify-deployment.sh              # now includes the [C] SW+cache checks
```

## Why not a Clear-Site-Data header or a SW kill-switch?

- **No `Clear-Site-Data: "*"`** — it would wipe auth/session/local prefs and log
  users out. Not justified when there's no rogue state to clear.
- **No service-worker kill-switch** — there is no service worker to kill
  (verified). Shipping one would be dead code. If a real SW is ever added later,
  this doc + the verify `[C]` check are where its retirement policy would live.

## Guardrail

`scripts/verify-deployment.sh` section `[C]` fails the deploy verification if:
`/sw.js` or `/service-worker.js` is ever served as JavaScript or as a 200 SPA
fallback, or if `index.html` is served long-cached. So a future regression is
caught automatically.
