import type { ReactNode } from 'react'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

export default function Layout({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {bare ? (
        <main id="main-content" className="pb-16 pt-14 sm:pb-0 sm:pt-16">{children}</main>
      ) : (
        <main id="main-content" className="mx-auto max-w-5xl animate-page-in px-4 pb-28 pt-24 sm:pb-24">{children}</main>
      )}
      <BottomNav />
    </div>
  )
}
