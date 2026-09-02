/**
 * Shared localStorage contract for the pre-signup character pick made on
 * the public landing page (`/`). The onboarding flow (CharacterIntroPage)
 * reads this after registration so the visitor's choice is honored instead
 * of thrown away — the whole point of letting them pick before signing up.
 *
 * No auth/account is involved: this is a client-side-only preference, wiped
 * once onboarding has consumed it (see `clearPreferredCharacter`).
 */
export const PREFERRED_CHARACTER_KEY = 'usam:preferredCharacter'

export type PreferredCharacterName = 'Azouz' | 'Zein' | 'Luma' | 'Codey'

export function setPreferredCharacter(name: PreferredCharacterName) {
  try {
    localStorage.setItem(PREFERRED_CHARACTER_KEY, name)
  } catch {
    // localStorage can throw in private-browsing/quota-exceeded edge cases —
    // the landing page still works, it just won't carry the preference.
  }
}

export function getPreferredCharacter(): PreferredCharacterName | null {
  try {
    const value = localStorage.getItem(PREFERRED_CHARACTER_KEY)
    if (value === 'Azouz' || value === 'Zein' || value === 'Luma' || value === 'Codey') {
      return value
    }
    return null
  } catch {
    return null
  }
}

export function clearPreferredCharacter() {
  try {
    localStorage.removeItem(PREFERRED_CHARACTER_KEY)
  } catch {
    // no-op
  }
}
