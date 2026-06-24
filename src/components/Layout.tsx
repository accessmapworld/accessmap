import type { ReactNode } from 'react'
import Navbar from './Navbar'

/** Standard page chrome (navbar + padded container). Home opts out for full-bleed. */
export default function Layout({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {bare ? (
        <main className="pt-16">{children}</main>
      ) : (
        <main className="mx-auto max-w-5xl animate-page-in px-4 pb-24 pt-24">{children}</main>
      )}
    </div>
  )
}
