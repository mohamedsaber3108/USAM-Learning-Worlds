import type { ReactNode } from 'react'
import { PublicNav } from './PublicNav'
import { PublicFooter } from './PublicFooter'

/** Shared shell for public content pages (nav + hero header + body + footer). */
export function PublicPage({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas-white text-ink-900">
      <PublicNav />
      <header className="border-b border-line bg-canvas-off">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-3 max-w-2xl text-ink-600">{subtitle}</p>}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>
      <PublicFooter />
    </div>
  )
}

/** Shell for auth pages (centered card, minimal chrome, brand mark). */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-off px-4 py-10">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
