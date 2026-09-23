import { describe, it, expect, beforeEach } from 'vitest'
import i18n, {
  setLanguage,
  getStoredLanguage,
  isRTLLanguage,
  applyDocumentDirection,
} from './index'

/**
 * Critical journey: language + RTL. Arabic must be a real layout mirror, not
 * just swapped text — the Tailwind `rtl:` variants and manual overrides key
 * off <html dir/lang>. These tests prove the toggle flips document direction,
 * changes the i18next language, and persists the choice.
 */
describe('language / RTL', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('dir')
    document.documentElement.removeAttribute('lang')
  })

  it('classifies Arabic as RTL and English as LTR', () => {
    expect(isRTLLanguage('ar')).toBe(true)
    expect(isRTLLanguage('ar-EG')).toBe(true)
    expect(isRTLLanguage('en')).toBe(false)
  })

  it('applyDocumentDirection sets dir and lang on <html>', () => {
    applyDocumentDirection('ar')
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    expect(document.documentElement.getAttribute('lang')).toBe('ar')

    applyDocumentDirection('en')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(document.documentElement.getAttribute('lang')).toBe('en')
  })

  it('setLanguage switches i18next, mirrors the document, and persists', () => {
    setLanguage('ar')
    expect(i18n.language).toBe('ar')
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    expect(getStoredLanguage()).toBe('ar')

    setLanguage('en')
    expect(i18n.language).toBe('en')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(getStoredLanguage()).toBe('en')
  })

  it('resolves real Arabic strings after switching', () => {
    setLanguage('ar')
    // A key that exists in both locales; Arabic value differs from the key.
    const value = i18n.t('missionLearn.badge')
    expect(value).toBe('اتعلّم')
    setLanguage('en')
    expect(i18n.t('missionLearn.badge')).toBe('Learn')
  })
})
