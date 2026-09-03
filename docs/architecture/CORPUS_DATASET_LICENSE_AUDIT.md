# Corpus / Dialogue / Media Dataset — License Audit & Integration Recommendation

**Status:** Research only. No dataset has been vendored, downloaded, or wired into code in this pass.
**Scope:** Covers the three engines flagged as license-sensitive "Missing" in
`USAM_KIDS_ENGINE_GAP_MATRIX.md`:
- **Corpus Engine** → WordNet, Wiktionary
- **Dialogue Dataset Layer** → DailyDialog, PersonaChat/ConvAI2
- **Media/Story Dataset Layer** → Project Gutenberg, LibriVox

**Product context:** USAM Learning Worlds is a commercial children's education product.
That means: (a) commercial use must be explicitly permitted, not just "free for research"; (b)
any copyleft/share-alike obligations that would force us to open-source proprietary app code or
content pipelines are a blocker; (c) attribution and branding restrictions must be checkable in CI,
not just "best effort."

---

## 1. Verdict Summary

| Dataset | License | Commercial OK? | Copyleft/share-alike risk to our code? | Recommendation |
|---|---|---|---|---|
| **WordNet** (Princeton) | WordNet License (permissive, BSD/MIT-like) | Yes, explicitly | None — no share-alike, no attribution-on-output requirement beyond citation | **Safe to integrate first** |
| **Project Gutenberg** (US public-domain texts) | Public domain (US) + PGLAF "Small Print"/trademark license on redistribution of the *Gutenberg-branded* file | Yes, for the text itself | None on the underlying text; only constrains use of the **"Project Gutenberg" name/trademark** and boilerplate header | **Safe to integrate second**, with one required step (see §4) |
| **Wiktionary** | CC BY-SA 4.0 (dual w/ GFDL) | Yes | **Share-alike**: derivative databases built from Wiktionary content must be re-licensed CC BY-SA and attribution must be preserved through our product | **Needs legal review** before integration (viable, but changes how we can license our derived lexical data) |
| **LibriVox** audio | Public domain (US) — LibriVox's own dedication | Yes, explicitly ("even to sell them") | None from LibriVox itself | **Conditionally safe**, but see caveat: underlying text must independently be public domain in the *user's* jurisdiction, and LibriVox explicitly disclaims verifying that outside the US — treat as **needs legal review** given a "children's ed product" likely serves non-US users too |
| **DailyDialog** | CC BY-NC-SA 4.0 | **No** — NonCommercial clause | N/A (blocked) | **Do not integrate.** Legally incompatible with a commercial product under the standard license terms. |
| **PersonaChat / ConvAI2** | Mixed/unclear — ParlAI lists "CC 4.0 BY" for the ConvAI2 task wrapper, but the underlying Persona-Chat paper/dataset does not carry an unambiguous, single commercial-use grant, and ConvAI2 rules require entrants to use only "publicly released" data without vouching for commercial re-licensing | Ambiguous | Possible attribution requirement (CC BY) but license chain to the actual raw dialogue text is not a single clean grant | **Needs legal review** — do not treat CC BY on the wrapper as clearance for commercial redistribution of the underlying crowdsourced conversations |

---

## 2. Recommended integration order

1. **WordNet** — cleanest license, zero share-alike risk, directly usable for the Corpus Engine
   (synonyms/definitions/POS/semantic relations for vocabulary + grammar features).
2. **Project Gutenberg texts** — public domain in the US, huge catalog of children's-appropriate
   classic literature, only needs the trademark/attribution guardrail in §4 before shipping.

Everything else (Wiktionary, LibriVox, PersonaChat, DailyDialog) should **not** be integrated this
pass. Wiktionary and LibriVox are plausible follow-ups pending legal sign-off; DailyDialog is a hard
no under its current license; PersonaChat/ConvAI2 needs a real answer on the underlying data's
license chain before any legal sign-off is even worth seeking.

---

## 3. License text citations

### WordNet (Princeton) — permissive, commercial use explicitly authorized
Source: https://wordnet.princeton.edu/license-and-commercial-use (mirrored at
https://languagelog.ldc.upenn.edu/myl/ldc/wordnet.license.html)

> "WordNet® is unencumbered, and may be used in commercial applications in accordance with the
> following license agreement. An attorney representing the commercial interest should review this
> WordNet license with respect to the intended use."

> "Permission to use, copy, modify and distribute this software and database and its documentation
> for any purpose and without fee or royalty is hereby granted, provided that you agree to comply
> with the following copyright notice and statements, including the disclaimer, and that the same
> appear on ALL copies of the software, database and documentation, including modifications that you
> make for internal use or for distribution."

> "The name of Princeton University or Princeton may not be used in advertising or publicity
> pertaining to distribution of the software and/or database. Title to copyright in this software,
> database and any associated documentation shall at all times remain with Princeton University and
> LICENSEE agrees to preserve same."

Implication: commercial use is fine; we must (a) keep the copyright notice/disclaimer attached to
any distributed copy of the database, and (b) not use "Princeton" in marketing.

### Project Gutenberg — public domain text + trademark-only restriction on redistribution
Source: https://gutenberg.org/policy/permission.html and the Full Project Gutenberg License
(https://www.gutenberg.org/policy/license.html)

> "The vast majority of Project Gutenberg eBooks are in the public domain in the US. This means
> that nobody can grant, or withhold, permission to do with this item as you please. 'As you please'
> includes any commercial use, republishing in any format, making derivative works or
> performances, etc."

> "The name 'Project Gutenberg' is a registered trademark... you need to pay royalties for
> commercial use [of the trademark/branded file]... This restriction is mainly to prevent you
> selling things that might be mis-perceived as being sold and/or supported by Project Gutenberg."

> "If an individual work is in the public domain in the United States... we do not claim a right to
> prevent you from copying, distributing, performing, displaying or creating derivative works based
> on the work **as long as all references to Project Gutenberg are removed**." (Full License §1.E.2)

Implication: the underlying text is free to use commercially with zero royalty as long as we strip
the Gutenberg header/footer boilerplate and don't use the "Project Gutenberg" name in our product.
Ingesting raw `.txt` files and stripping the standard header/footer block before use is the
required step (see §4).

### Wiktionary — CC BY-SA 4.0 / GFDL dual license
Source: https://en.wiktionary.org/wiki/Wiktionary:Copyrights

> "The original texts of Wiktionary entries are dual-licensed to the public under both the
> Creative Commons Attribution-ShareAlike 4.0 International License (CC-BY-SA) and the GNU Free
> Documentation License (GFDL)."

Implication (per CC BY-SA 4.0, legal code at https://creativecommons.org/licenses/by-sa/4.0/legalcode):
commercial use and selling copies/adaptations is allowed, but any adapted database we build that
incorporates Wiktionary content must (a) carry attribution, and (b) be licensed onward under
CC BY-SA — this can conflict with treating the resulting lexical dataset as fully proprietary. Needs
a legal call on how we scope/isolate Wiktionary-derived fields so the ShareAlike obligation doesn't
"infect" unrelated proprietary content.

### LibriVox — public domain audio, but jurisdiction caveat
Source: https://librivox.org/pages/public-domain and https://wiki.librivox.org/index.php/Copyright_and_Public_Domain

> "LibriVox recordings are in the public domain, which means people can do anything they like with
> them... they can: sell them... broadcast them, put them in commercials..."

> "LibriVox makes good faith efforts to ensure that the texts recorded are public domain in the
> United States... it is impossible for us to verify the copyright status of every work in every
> country... a work may be in the public domain in the US, but still be under copyright in other
> countries."

Implication: safe for US distribution; if the product serves non-US markets (likely, for a
children's ed product), each individual title's home-country copyright status needs checking before
that specific audio file ships in that market. This is a per-title clearance burden, not a blanket
green light — treat as "needs legal review" for scope of rollout, even though the base license is
permissive.

### DailyDialog — non-commercial, blocks this product
Source: https://huggingface.co/datasets/roskoN/dailydialog and
https://github.com/liuzeming01/XDailyDialog (§8 License)

> "DailyDialog dataset is licensed under CC BY-NC-SA 4.0... Note the dataset may not be adopted for
> commercial use."

Implication: hard blocker under the standard, most commonly cited license terms for this dataset.
(Note: a CC0/public-domain repackaging exists on Kaggle from a third party — that repackaging's
provenance and right to relicense the original authors' CC BY-NC-SA-covered text is not verified and
should not be relied on without legal sign-off; it does not override the original dataset creators'
stated license.)

### PersonaChat / ConvAI2 — unresolved license chain
Sources: https://github.com/facebookresearch/ParlAI/tree/main/parlai/tasks/convai2 (lists
"License: CC 4.0 BY" for the ParlAI task wrapper) and http://convai.io/2018/ (competition data page).

The ParlAI *task wrapper* metadata states CC BY 4.0, but this describes ParlAI's packaging of the
data for the ConvAI2 competition, not a clear, singular commercial grant over the original
crowdsourced Persona-Chat conversations from the original paper (Zhang et al., 2018). No single
authoritative license page from the original data collectors states unrestricted commercial
re-use rights. This ambiguity is itself the reason for legal review — do not treat the ParlAI
metadata field as a substitute for a real license grant on the underlying text.

---

## 4. Required implementation guardrails (for when integration is later approved)

- **WordNet**: vendor the official WordNet 3.0/3.1 database files with the LICENSE file kept
  alongside; never remove the copyright/disclaimer notice from redistributed copies; do not use
  "Princeton" or "WordNet" in a way implying endorsement.
- **Project Gutenberg**: ingestion pipeline must programmatically strip the standard Gutenberg
  header/footer boilerplate and must not surface the "Project Gutenberg" name in the shipped
  product UI/branding; keep a manifest mapping each ingested title to its Gutenberg ebook ID/URL for
  audit trail, but that's for internal traceability, not required attribution.
- **Wiktionary / LibriVox / DailyDialog / PersonaChat**: no ingestion code, fixtures, or seed
  scripts should be added until Legal explicitly signs off per row above. This audit does not
  authorize integration of any of the four.

---

## 5. What legal review should specifically resolve

1. Wiktionary: whether ShareAlike can be scoped to just the lexical-data module without extending
   to unrelated proprietary app code/content, and what attribution surface (in-app credits page?)
   satisfies CC BY-SA 4.0 §3(a).
2. LibriVox: which titles/markets need per-title public-domain verification outside the US before
   audio ships to non-US users, and who owns that verification workflow.
3. PersonaChat/ConvAI2: obtain a clear license grant statement from the original dataset authors (or
   substitute a dataset with an unambiguous commercial license, e.g. build fully synthetic
   persona-based dialogue via the existing Bedrock-backed `conversation.service.ts` instead of
   ingesting this corpus at all).
4. DailyDialog: confirm no integration path exists under CC BY-NC-SA for a commercial product; if a
   dialogue corpus is still wanted, source an alternative with a compatible commercial license
   instead.
