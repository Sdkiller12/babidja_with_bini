'use client';
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import Logo from '@/components/Logo'
import { usePathname } from 'next/navigation'

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isPayment = pathname.includes('/paiement')

  return (
    <div className="grid min-h-dvh w-full min-w-0 place-items-center overflow-x-clip px-4 py-6 sm:py-8">
      <div className="relative my-auto w-full min-w-0 max-w-md overflow-hidden rounded-3xl bg-white shadow-lg">
        <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="group grid size-9 min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
          <span className="min-w-0 flex-1 text-center"><Logo /></span>
          {isPayment ? (
            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-secondary">
              <Lock className="size-3" /> Sécurisé
            </div>
          ) : (
            <div className="w-9 shrink-0" />
          )}
        </header>
        <div className="min-w-0 p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
