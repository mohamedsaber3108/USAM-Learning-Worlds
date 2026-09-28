# USAM Kids — English Data Source Registry

> Reference Bible §9. Every dataset/media used by the English engine needs
> source + license + commercial-use verification before adoption. This registry
> tracks candidates and their status. **No source is used in production until its
> license row is verified.**

Date: 2026-09-23

---

## Lexical / language resources
| Resource | Use | License (verify at source) | Commercial | Decision |
| --- | --- | --- | --- | --- |
| WordNet (Princeton) | vocabulary/synsets | WordNet license (permissive) | likely yes | REFERENCE → verify |
| Wiktionary | definitions | CC BY-SA | attribution + share-alike | REFERENCE (SA caution) |
| ConceptNet | semantic relations | CC BY-SA 4.0 | attribution + SA | REFERENCE (SA caution) |
| Universal Dependencies | grammar/parsing | per-treebank (mixed) | varies | verify per treebank |
| CMU Pronouncing Dictionary | pronunciation | BSD-like | yes | ADOPT-candidate → verify |
| LanguageTool | grammar checking | LGPL/others | verify per component | POC → verify |

## Open / public-domain text & media
| Resource | Use | License | Notes |
| --- | --- | --- | --- |
| Project Gutenberg | reading texts | public domain (US) | verify per-title + jurisdiction |
| Wikisource | texts | mixed (mostly PD/CC) | verify per-item |
| LibriVox | audiobooks | public domain | verify per-recording |
| Wikimedia Commons | images | mixed CC/PD | verify per-file + attribution |
| Openverse | images | CC/PD aggregator | verify per-file |
| Internet Archive | mixed media | mixed | verify per-item |
| Mozilla Common Voice | speech data | CC0 | good for STT training/benchmark |

## Alignment / pronunciation / speech tooling
Whisper · faster-whisper · WhisperX · Montreal Forced Aligner · phonemizer · eSpeak NG — see `VOICE_BENCHMARK.md`; license verify each.

## Required English sub-engines (from Product Bible §5)
vocabulary · grammar · phonics (age-appropriate) · spelling · reading · listening ·
speaking · pronunciation · writing · conversation · shadowing · dictation · stories ·
roleplay · CEFR mapping · spaced review · adaptive difficulty · assessment · project-based English.

## Rule
Any dataset/media enters the registry as `REFERENCE` until its license is verified
against the source's own license file; only then can it move to `ADOPT`. Share-alike
(CC BY-SA) sources are flagged for legal review before commercial embedding.

## Blocker
- Legal review required for CC BY-SA sources before commercial use (Bible §21 classification).
