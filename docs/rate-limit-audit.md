# Rate-Limit (@Throttle) Audit — Family-Shared-IP Risk

Date: 2026-09-03
Trigger: production incident — `/api/auth/register` and `/api/auth/login` throttle
(originally 5 req/15min) locked out families sharing one home/NAT IP. Both were
raised to 20 req/15min in `backend/src/modules/auth/auth.controller.ts`.

## Method
`grep -rn "@Throttle" backend/src` across the entire backend, plus a check of
the global `ThrottlerModule` config in `app.module.ts` and any other rate-limit
mechanism (`SkipThrottle`, custom guards, `express-rate-limit`, etc).

## Findings

### Route-level `@Throttle` overrides (the only ones in the codebase)
| Endpoint | File | Limit | Status |
|---|---|---|---|
| `POST /auth/register` | `auth/auth.controller.ts:13` | 20 req / 15 min / IP | Already fixed (raised from 5) in the incident response |
| `POST /auth/login` | `auth/auth.controller.ts:22` | 20 req / 15 min / IP | Already fixed alongside register (same reasoning: shared household IP) |

No other controller in `backend/src` uses `@Throttle`, `@SkipThrottle`, or any
custom per-route rate limiter. Confirmed via:
```
grep -rn "@Throttle" backend/src        # only auth.controller.ts (2 hits)
grep -rln "SkipThrottle" backend/src    # no hits
grep -rn "@nestjs/throttler" backend/package.json  # only dependency import
```

### Global default throttle (applies to every other route, incl. AI/chat/voice)
`app.module.ts`:
```ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])
```
100 requests / 60s / IP, applied guard-wide via `APP_GUARD`. This covers all
AI/coaching/voice/chat endpoints that were specifically in scope for this audit:
- `POST /characters/:id/chat`, `/conversations`, `/conversations/:id/messages`
- `POST /voice/turn`
- `POST /english-coach/conversation`, `/grammar`, `/pronunciation`, `/vocabulary`, `/reading`
- `POST /coding-coach/debug`, `/review`, `/explain`, `/challenge`

None of these have a route-level override, so they all use the global 100
req/min/IP default — generous enough that multiple siblings chatting with an
AI coach/character simultaneously from one home IP would not realistically
trip it (100 requests in 60s across a household during normal use is very
unlikely; a genuinely abusive bot ignoring the household would). No change
needed here.

### Correctness precondition (verified, not modified)
`main.ts` sets `app.set('trust proxy', 1)` so the guard buckets by real client
IP (from `X-Forwarded-For`, one nginx hop) rather than nginx's own IP for
every request — this was actually the root cause of the original incident
(all users behind nginx were being bucketed into one IP), not just the low
`limit: 5`. That fix is already in place and unrelated to this audit's scope
change.

## Conclusion
- Audited every `@Throttle` decorator in the codebase: **only 2 exist**, both on
  `auth.controller.ts` (`register`, `login`), and both were **already fixed**
  in the incident response that prompted this audit.
- No other endpoint (AI chat, voice, coaching, admin, password-reset, etc.) has
  a route-level throttle override to adjust. The AI/voice/coaching endpoints
  that a family could plausibly hammer from one IP all rely on the global
  100 req/min/IP default, which is generous enough to not be a false-positive
  risk for normal multi-child household use.
- **No code changes required.** There is no second family-IP false-positive
  bug hiding in another `@Throttle` decorator — the register/login fix was
  the only instance of this pattern in the codebase at present.
- Recommendation for the future: if any module later adds a route-level
  `@Throttle` with a tight limit (e.g. AI chat, voice), apply the same
  household-NAT-aware limit (~20+/15min) rather than aggressive defaults like
  5/15min, and always confirm `trust proxy` is correctly scoped so the limiter
  buckets by real client IP.
