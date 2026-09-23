import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

/**
 * jsdom in this project is started without a persistent localStorage backend
 * (the "--localstorage-file not provided" warning), so `window.localStorage`
 * can be undefined. The app reads/writes it in many places (auth tokens,
 * usam.language, etc.), so we install a simple in-memory implementation and
 * reset it before every test for isolation.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear(): void {
    this.store.clear()
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

const memoryStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
})

beforeEach(() => {
  memoryStorage.clear()
})
