import '@testing-library/jest-dom/vitest'

// jsdom in this Node/vitest config exposes no localStorage — provide a simple
// in-memory implementation so storage-based code (i18n language, auth tokens)
// works under test. Tests only.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>()
  const mem: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => void store.delete(k),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
  }
  Object.defineProperty(globalThis, 'localStorage', { value: mem, configurable: true })
}

// jsdom has no matchMedia; some code (reduced-motion checks) expects it.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
