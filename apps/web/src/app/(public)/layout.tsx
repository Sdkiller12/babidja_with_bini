import NavbarPublic from '@/components/layout/NavbarPublic'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip">
      <NavbarPublic />
      <main className="w-full min-w-0 flex-1 pb-28 sm:pb-24 lg:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  )
}
