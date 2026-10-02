/**
 * Per-domain companion framing — shared across any page that knows which
 * domain it's in (DomainPathPage) and wants to show "who leads this subject"
 * without a server round-trip. Extracted from DomainPathPage (where it
 * originated) so it's reusable, not re-declared per page.
 *
 * Pages that do NOT know the domain up front (MissionPlayerPage, PracticePage,
 * ProjectDetailPage — the backend's mission/project responses carry no
 * domain/world field) use `charactersApi.orchestrate()` instead, which
 * resolves the same "who should be present" question server-side with a
 * real domain-aware fallback chain. Keep both: this map for domain-page
 * contexts, orchestrate() for everywhere else.
 */
export const DOMAIN_COMPANION: Record<string, string> = {
  english: 'Luma',
  coding: 'Codey',
  'ai-literacy': 'Nova',
  creativity: 'Mira',
}
