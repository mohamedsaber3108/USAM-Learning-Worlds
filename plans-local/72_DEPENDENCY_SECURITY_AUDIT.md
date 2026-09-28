# 72 — Backend Dependency Security Audit

> Trigger: `npm ci` on the backend reports **73 vulnerabilities (4 low · 52
> moderate · 16 high · 1 critical)**. This document analyzes every HIGH and the
> CRITICAL, decides a per-issue action, and explicitly does NOT run
> `npm audit fix --force` (which would major-bump NestJS 10→12, OpenTelemetry,
> and @xenova/transformers and near-certainly break the build/runtime).
>
> Source: `npm audit --json` in `backend/` (2026-09-29). Runtime-reachability
> assessed against actual imports in `backend/src`.
> Decision labels: FIX_NOW · UPGRADE · REPLACE · TRANSITIVE_WAIT ·
> NOT_RUNTIME_REACHABLE · FALSE_POSITIVE/NOT_APPLICABLE · NEEDS_RESEARCH.

## TL;DR
- The single **CRITICAL** (`protobufjs`) is transitive under `@xenova/transformers`
  and is **not reachable by untrusted input** — we only decode our own bundled,
  offline embedding model, never attacker-controlled protobuf. Tracked, not a
  production emergency; the real fix is a heavy transformers upgrade → NEEDS_RESEARCH.
- Most HIGH issues are **dev/build-only** (`@nestjs/cli`, `@nestjs/schematics`,
  `glob` CLI, `picomatch`, `js-yaml`, `tmp`) — not shipped to prod runtime.
- Two genuinely runtime-relevant HIGHs are cheap wins: **`multer`** and
  **`lodash`** — both fixed by a controlled NestJS minor/patch bump, tracked as UPGRADE.
- No blind `audit fix --force`. Production is NOT claimed "security-clean" while
  the critical is open; it is claimed **not runtime-exploitable by untrusted input**,
  with evidence below.

---

## CRITICAL

### protobufjs — Arbitrary code execution / code injection via bytes-field defaults
- Package: `protobufjs` (`<=7.6.2`). **Transitive.**
- Path: `@xenova/transformers` → `onnxruntime-web` → `onnx-proto` → `protobufjs`.
- Runtime-reachable? **Runtime-present but NOT untrusted-input-reachable.**
  `@xenova/transformers` is used only by `EmbeddingService`
  (`src/modules/ai/services/embedding.service.ts`) to run the local, offline
  `Xenova/all-MiniLM-L6-v2` model: lazy-loaded, `env.allowLocalModels = true`,
  fail-soft (returns null → falls back to full-text search). The protobuf decode
  path only parses OUR bundled model files, never learner input or network data.
  The exploit requires decoding attacker-controlled protobuf, which never happens.
- Exploit class: code injection in generated `toObject` (crafted `.proto`/bytes defaults).
- Patched: protobufjs ≥ 7.6.3+; but `fixAvailable` points at
  `@xenova/transformers@1.4.2` (a **major DOWNGRADE**, isSemVerMajor) — npm's
  "fix" is wrong/destructive here (would drop from ^2.17.2 to 1.4.2 and change the API).
- Breaking-change risk: HIGH (transformers major; embedding pipeline API differs).
- **Decision: NEEDS_RESEARCH.** Do not take npm's downgrade. Options to research:
  (a) pin a patched `protobufjs` via an npm `overrides` entry and verify the ONNX
  runtime still loads the model; (b) move embeddings behind a feature flag / out
  of the main process; (c) accept-and-monitor given no untrusted-input path.
  Meanwhile document as not-exploitable. NOT a deploy blocker.

---

## HIGH — runtime-relevant (act)

### multer — DoS via incomplete cleanup / resource exhaustion
- Package: `multer` (`<=2.2.0`). Transitive via `@nestjs/platform-express` (runtime DEP).
- Runtime-reachable? **YES — confirmed.** `voice.controller.ts` uses
  `FileInterceptor` (audio upload), so multer runs on that route. Reachable.
- Exploit class: DoS (resource exhaustion / temp-file cleanup).
- Patched: multer ≥ 2.0.2 line; `fixAvailable` = `@nestjs/platform-express@12.1.1` (major).
- Breaking-change risk: MEDIUM — pulling multer forward via a NestJS major is
  heavy; prefer an `overrides: { "multer": "^2.0.2" }` (or latest safe 2.x) to
  patch in place WITHOUT the Nest major.
- **Decision: UPGRADE** (via npm `overrides` to a patched 2.x; verify uploads +
  `nest build` + suite). Add an upload-size/limit regression if practical.

### lodash — code injection via `_.template`, prototype pollution in `_.unset`/`_.omit`
- Package: `lodash` (`<=4.17.23`). Transitive.
- Runtime-reachable? **Very low — confirmed.** `grep` of `backend/src` shows NO
  direct lodash import and NO `_.template` call anywhere. Purely transitive.
- Patched: lodash ≥ 4.17.24; `fixAvailable` = `@nestjs/config@12` (major) — again
  npm over-reaches.
- Breaking-change risk: LOW for lodash itself; HIGH if via the Nest major.
- **Decision: UPGRADE** via `overrides: { "lodash": "^4.17.24" }`; verify build+suite.
  (Confirm no direct `_.template` call first — grep.)

---

## HIGH — dev / build-time only (defer; not shipped to prod runtime)

These live under devDependencies or build tooling and do not execute in the
running server. Not a production runtime risk; fix opportunistically with the
next toolchain bump.

| Package | Root | Why dev-only | Decision |
|---|---|---|---|
| `@nestjs/cli` (via `@angular-devkit/*`) | devDep `^10` | build/scaffold CLI, not imported at runtime | NOT_RUNTIME_REACHABLE (fix on Nest 11/12 upgrade) |
| `@nestjs/schematics` → `picomatch` (ReDoS, POSIX class injection) | devDep | codegen only | NOT_RUNTIME_REACHABLE |
| `glob` CLI command injection (`-c/--cmd`) | transitive, dev | we never invoke the glob CLI with `--cmd` | NOT_RUNTIME_REACHABLE |
| `js-yaml` (CPU DoS via merge keys) | transitive, tooling | not used to parse untrusted YAML at runtime | NOT_RUNTIME_REACHABLE (verify no runtime yaml.load of user input) |
| `tmp` (symlink/path traversal) | transitive, dev/test | build/test temp files, not runtime | NOT_RUNTIME_REACHABLE |

## HIGH — OpenTelemetry cluster (observability)
- `@opentelemetry/auto-instrumentations-node` (DEP `^0.47.1`),
  `@opentelemetry/sdk-node` (DEP `^0.52.1`), `@opentelemetry/sdk-trace-node`,
  `@opentelemetry/propagator-jaeger` (JaegerPropagator DoS via malformed header).
- Runtime-reachable? **Gated — confirmed opt-in.** `src/observability/tracing.ts`
  only starts the SDK when `OTEL_*` env is set (opt-in + fail-soft). If OTel is NOT
  enabled in prod, this whole cluster is NOT_RUNTIME_REACHABLE. The Jaeger DoS also
  needs Jaeger propagation specifically enabled. → confirm the prod env has no
  `OTEL_*` set; if so, downgrade to NOT_RUNTIME_REACHABLE.
- `fixAvailable` = `@opentelemetry/sdk-node@0.222.0` (major).
- Breaking-change risk: MEDIUM (OTel majors churn APIs frequently).
- **Decision: NEEDS_RESEARCH** — first confirm if/how OTel runs in prod; if off,
  downgrade to NOT_RUNTIME_REACHABLE; if on, UPGRADE the OTel cluster together in
  a dedicated PR (they must move in lockstep) and verify traces still export.

## HIGH — @xenova/transformers native chain (sharp / onnxruntime-web / onnx-proto)
- Same root as the critical (`@xenova/transformers` runtime DEP `^2.17.2`).
  `sharp` (libvips/libheif CVEs), `onnxruntime-web`, `onnx-proto`.
- Runtime-reachable? `sharp` image-processing CVEs need processing of
  attacker-supplied images through this chain; embeddings don't process user
  images (text only). `onnx*` only loads our bundled model. → low real exposure.
- `fixAvailable` all point at the transformers **downgrade** to 1.4.2 (wrong).
- **Decision: NEEDS_RESEARCH** (bundle with the protobufjs/transformers research;
  consider `overrides` for `sharp` to a patched release independent of transformers).

---

## What NOT to do
- ❌ `npm audit fix --force` — npm's `fixAvailable` for the transformers chain is a
  **major downgrade to 1.4.2** (breaks the embedding API) and for lodash/multer it
  bumps NestJS to 12 (major). Blindly applying it would break the build and/or
  runtime with no security benefit over targeted `overrides`.

## Recommended action order (separate, tested PRs — none are deploy blockers)
1. **UPGRADE via `overrides`** (cheap, runtime-relevant): `multer` → patched 2.x,
   `lodash` → `^4.17.24`. Verify `nest build` + 84-test suite + a quick upload smoke.
2. **NEEDS_RESEARCH**: confirm OTel prod usage (Jaeger propagation on/off) → then
   either downgrade to NOT_RUNTIME_REACHABLE or do a lockstep OTel major upgrade.
3. **NEEDS_RESEARCH**: transformers/protobufjs/sharp — try `overrides` for a patched
   `protobufjs`/`sharp` without moving transformers; verify the embedding model still
   loads; else feature-flag/relocate embeddings. Track the critical until closed.
4. Dev-only HIGHs ride along with the eventual NestJS 10→11/12 toolchain upgrade.

## Moderate/Low (52 + 4)
Not individually triaged here (out of the HIGH/CRITICAL scope requested). Most are
transitive dev-tooling advisories. To be swept during the toolchain upgrade in step 4.

## Verification requirement for any fix
Every dependency change above must: pass `nest build`, pass the full 84-test suite,
and (for multer/sharp) a manual smoke of the affected runtime path, BEFORE deploy.
No dependency bump ships without a green build + suite.
