# 46 — FINAL ACCEPTANCE (does the PRODUCT work?)

> Directive §39: not "does the software work" but "does the PRODUCT work" for
> real learner personas + a parent. This is the acceptance gate before the
> reconstruction is called finished. Visual/live checks are only "passed" if
> ACTUALLY OBSERVED in a browser — otherwise the limitation is documented here.

Date: 2026-09-30

---

## 1. Learner personas (walk each end-to-end)

| Persona | Band | Expectation |
|---|---|---|
| 8-year-old beginner | 8–9 Explorer | voice-forward, 1-level nav, large targets, Azouz hero, never stuck |
| 10-year-old intermediate | 10–11 Creator | blocks+script, real projects, guided, evidence starts to matter |
| 12-year-old | 12–14 Pathfinder | denser, real editor, mastery/portfolio thinking |
| 14-year-old advanced | 12–14 Pathfinder | abstract/ethics, self-directed, deeper projects |

## 2. The walk (each persona)

First visit → onboarding (§15) → meet Azouz → diagnostic → first mission →
learning (teach→practice) → voice → practice (review) → project → assessment →
mastery → reward → RETURN session. Then the parent journey (16).

## 3. Child-truth checklist (must all pass, no adult) — per persona

- [ ] Understands what to do without a teacher.
- [ ] Navigates + recovers from confusion.
- [ ] Sees progress; chooses meaningfully.
- [ ] Interacts with AI safely.
- [ ] Creates something; sees evidence of growth.
- [ ] Always knows what's next.

## 4. Parent-truth checklist

- [ ] Sees what the child learns (mastery by domain).
- [ ] Sees what they made (portfolio).
- [ ] Sees how progress is measured + that it's safe.
- [ ] Sees price mapping to outcomes.

## 5. Fail conditions (any ⇒ reconstruction NOT finished — directive §39)

Any journey that feels: confusing · empty · disconnected · fake · unfinished ·
overly childish · too difficult · too static · like a generic LMS. Also fails if:
any required surface is mock/placeholder; a child hits a dead end; AI violates a
guardrail; content shown as "final" is unreviewed.

## 6. Evidence requirements (anti-fake-green)

- Each checklist item marked pass ONLY with an observed artifact (screenshot /
  recording / live walk note). The screenshot harness (42 §6) produces pages ×
  {desktop,tablet,mobile} × {EN,AR} × age modes for human review.
- EG-Arabic voice: WER on real child speech recorded before "speaking" passes.
- If this environment cannot run the live app/browser, THIS DOC records that
  limitation explicitly and the checks become an OWNER-RUN manual acceptance
  pass on the server — NOT silently marked passed.

## 7. Current honest state (2026-10-01, after inner-surface reconstruction)

### What is DONE + verifiable (code-side)
- Canonical tree LOCKED = `frontend/` (deploy-chain verified). Cache/SW hygiene
  fixed + live. Landing + dashboard reconstructed to the 4 domains, LIVE.
- Inner-surface reconstruction pass complete across all 7 batches: Learn hub +
  worlds reframed to 4 domains; missions filters made real; Progress mastery-bug
  fixed; Entrepreneurship vertical-slice seed authored (thinnest domain);
  characters confirmed on the locked 15 roster (no old cast); voice confirmed a
  real ASR→AI→TTS round-trip with honest fallback; parent/commerce/admin
  confirmed real; nav active-state aligned to the 4 domains.
- Every batch gated green: frontend lint 0 / tsc 0 / build 0 / 40 tests /
  home-bundle; backend tsc 0 / 120 tests / drift gates (on deploy).
- No mocks in `frontend/` production source (verified sweep). The mock-backed
  tree was the LEGACY root `src/` (not deployed).

### What is HONESTLY NOT yet verified (owner-run — I cannot see pixels/live)
These are the §3/§4 checklists; they require a real browser on the live domain,
which only runs on the server. They are NOT marked passed:
- [ ] Child-truth walk for 8 / 10 / 12 / 14 personas on `https://kids.usamif.com`.
- [ ] Parent-truth walk.
- [ ] EN/AR + RTL on phone / tablet / desktop (visual).
- [ ] Voice end-to-end on real child speech (EG-Arabic WER).
- [ ] The 1.9MB coding-runtime preload perf item (known tradeoff, §45).

### Owner-run live acceptance checklist (run on the server, then eyes-on)
```bash
cd ~/USAM-Learning-Worlds && git pull            # get all pushed batches
# backend: apply the 4-domain + worlds + entrepreneurship content
cd backend && npm run seed:entrepreneurship:vertical   # (+ other seed:* as desired)
cd .. && DEPLOY_BACKEND=1 RUN_TESTS=1 bash scripts/deploy.sh
bash scripts/verify-deployment.sh                # must end GREEN incl [C]
# then eyes-on: screenshot harness (if present) OR manual browser walk per §2
```
Then open `https://kids.usamif.com/` in a fresh browser and walk §2 for each
persona + the parent journey, checking §3/§4. Report any surface that feels
confusing/empty/fake/unfinished/too-hard/too-static/LMS-like (§5 fail conditions).

The reconstruction is "finished" only when those owner-run walks pass with
observed evidence. Code-side: all required surfaces are real + green + pushed.

## 8. Known standing limitations (documented, not hidden)

- Full WCAG conformance needs manual assistive-tech testing + expert review.
- Live/browser QA + EG-Arabic voice must run where the app + backend run
  (server), not necessarily this dev workspace.
- Legal/privacy jurisdiction copy needs counsel review (owner).
- Real payment requires owner price approval + gateway creds.
