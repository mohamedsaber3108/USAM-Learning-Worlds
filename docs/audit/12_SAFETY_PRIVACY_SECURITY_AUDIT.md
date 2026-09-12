# 12 — Safety, Privacy & Security Audit

**Baseline:** `origin/main @ 3a787c0`. Highest-stakes area for a children's product. Evidence from AI/backend/DB audits.

## Child safety

| ID | Status | Evidence |
|---|---|---|
| USAM-SAFE-001/002 | **PARTIALLY_IMPLEMENTED (strong core)** | 5-state model (`safe/restricted/blocked/escalation_required/parent_approval_required`) in `character-safety.service`; moderation fails **closed** |
| USAM-SAFE-003 | **PRESENT** | moderation wired on conversation input (fail-closed); character output re-checked |
| USAM-SAFE-004 | **PRESENT** | `SafetyEscalation` queue + `REFERRED_TO_GUARDIAN` → `PARENT_FLAG` |
| USAM-SAFE-005 | **PARTIALLY_IMPLEMENTED** | hallucination hedge + red-team battery (26 cases); **LLM-adversarial cases skipped in CI** |
| **USAM-SAFE-006** | **FAILING GAP (P0)** | `english-coach`, `coding-coach`, legacy `ai.controller` enforce **NO** moderation/PII — unprotected child-facing AI |
| USAM-CHAR-004/005 | **strong** | deterministic parent-bypass + dependency detection; safety footers in every character prompt |
| USAM-SEC-003 | **MISSING** | no AI tool/capability permission system |

## Privacy / legal

| ID | Status | Evidence / gap |
|---|---|---|
| USAM-PRIV-001 | **REQUIRES_LEGAL_REVIEW** | no jurisdiction matrix (COPPA/GDPR-K/UK Children's Code/EU AI Act/Egypt/Saudi); consent is a minimal `Guardianship.consentedAt` + JSON controls |
| USAM-PRIV-002 | **PARTIALLY_IMPLEMENTED** | retention only on 2 AI-memory models (180/90 days) + purge script; no platform-wide data-lifecycle policy; voice/upload retention undefined |
| USAM-PROF-004 | **REQUIRES_LEGAL_REVIEW** | no explicit "never stored" data-minimization policy |

## Security

| ID | Status | Evidence |
|---|---|---|
| USAM-SEC-001 | **PARTIALLY_IMPLEMENTED / issues** | helmet + compression + global ValidationPipe + trust-proxy present; **register privilege escalation (BE-A1, CRITICAL)**; **refresh broken (API-3)**; **generic-only throttle (BE-A3)**; mission IDOR (BE-M1) |
| USAM-SEC-002 | **REQUIRES_SECURITY_REVIEW** | secret-scan (gitleaks) in CI; no SBOM/threat-model/supply-chain review documented |
| USAM-CODE-005 | **REQUIRES_SECURITY_REVIEW** | code sandbox isolation (Pyodide/Sandpack) not verified for resource/network/FS limits |

## Priority safety/security actions (roadmap, not executed)

1. **P0 — Close SAFE-006:** wire moderation+PII+safety into english-coach, coding-coach, legacy ai.controller.
2. **P0 — Fix BE-A1:** restrict public register to learner/guardian; block ADMIN/MODERATOR.
3. **P0 — Fix BE-M1 IDOR + API-3 refresh.**
4. **P1 — Auth-specific throttling** (login/register brute-force).
5. **P1 — Code sandbox security review** before exposing code execution to children.
6. **P1 — Legal matrix + consent/retention design** (needs counsel).
7. **P1 — AI tool/capability permission system** before any AI tool-use is enabled.
8. **P1 — Extend red-team to a real adversarial eval environment.**
