# 42 — TESTING & EVALUATION

> How correctness is proven. Honesty rule: a test passing proves the test; visual
> QA is only "passed" if actually observed in a browser (directive, 46). No fake
> green.

Date: 2026-09-30

---

## 1. Test layers

| Layer | What | Where |
|---|---|---|
| Backend unit/spec | services, algorithms (mastery, WER, FSRS), guards | `*.spec.ts` (many exist: entitlements, missions IDOR, wer, …) |
| Backend integration | controller→service→db contract shapes | per module |
| Frontend unit | components, hooks (age presentation, resolveCopy) | vitest + testing-library |
| Frontend contract | each service's real-API impl returns the typed contract | per `src/services/*` |
| E2E journeys | child first-run, learning loop, parent, mod, admin | Playwright (reuse the harness pattern) |
| Visual QA | pages × {desktop,tablet,mobile} × {EN,AR} × age modes | Playwright screenshots → human review |
| AI eval | character behavior/safety regression | backend `ai-eval` harness (AIEvalRun/Result) |

## 2. Gating per phase (44)

Each phase ends: `tsc`/build green + relevant tests pass + commit. No phase
advances on red. Backend `check-migrations-applied.ts` + existing specs run.

## 3. Shape verification (the anti-assumption rule — 40 §3)

For every mock→real swap, verify the real JSON shape by reading the controller/
DTO OR calling the live API — grep does NOT index `backend/`, so never assume.
Record verified shapes in 45.

## 4. Product-level evaluation (directive §39 — the real bar)

Beyond "does the software work": does the PRODUCT work for 8/10/12/14-year-olds
and a parent (46)? This requires OBSERVED browser walks (the screenshot harness +
human review), not green unit tests alone.

## 5. Honesty on QA

- If the environment can't run live/browser QA, document the exact limitation +
  produce the manual acceptance checklist (46). Do NOT mark visual QA passed if
  not observed.
- EG-Arabic voice accuracy (WER) verified on real child speech before "speaking
  done".
- Content marked "final" only when VALIDATED/reviewed (12 §4), not just present.

## 6. Reuse

The prior Playwright preview-verify + screenshot harness pattern (console/network/
RTL checks + per-page screenshots across viewports/langs) is reusable for the ONE
app's QA. Point it at the rebuilt app once staged.
