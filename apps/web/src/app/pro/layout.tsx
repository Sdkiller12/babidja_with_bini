'use client';

import { usePathname } from 'next/navigation'
import { House, CalendarDays, LayoutGrid, CalendarRange, Users, Settings, Car, MessageSquare } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

const hotelItems = [
  { href: '/pro', icon: House, label: 'Tableau de bord', exact: true },
  { href: '/pro/hotel/reservations', icon: CalendarDays, label: 'Réservations' },
  { href: '/pro/hotel/catalogue', icon: LayoutGrid, label: 'Catalogue (chambres)' },
  { href: '/pro/hotel/calendrier', icon: CalendarRange, label: 'Calendrier' },
  { href: '/pro/hotel/employes', icon: Users, label: 'Employés' },
  { href: '/pro/hotel/messagerie', icon: MessageSquare, label: 'Messagerie' },
  { href: '/pro/hotel/parametres', icon: Settings, label: 'Paramètres' },
]

const carItems = [
  { href: '/pro/voiture', icon: House, label: 'Tableau de bord', exact: true },
  { href: '/pro/voiture/reservations', icon: CalendarDays, label: 'Réservations' },
  { href: '/pro/voiture/flotte', icon: Car, label: 'Flotte (véhicules)' },
  { href: '/pro/voiture/calendrier', icon: CalendarRange, label: 'Calendrier' },
  { href: '/pro/voiture/employes', icon: Users, label: 'Employés' },
  { href: '/pro/voiture/messagerie', icon: MessageSquare, label: 'Messagerie' },
  { href: '/pro/voiture/parametres', icon: Settings, label: 'Paramètres' },
]

import AuthGuard from '@/components/auth/AuthGuard'
import { UtensilsCrossed } from 'lucide-react'

const restaurantItems = [
  { href: '/pro/restaurant', icon: House, label: 'Tableau de bord', exact: true },
  { href: '/pro/restaurant/reservations', icon: CalendarDays, label: 'Réservations' },
  { href: '/pro/restaurant/catalogue', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/pro/restaurant/employes', icon: Users, label: 'Employés' },
  { href: '/pro/restaurant/messagerie', icon: MessageSquare, label: 'Messagerie' },
  { href: '/pro/restaurant/parametres', icon: Settings, label: 'Paramètres' },
]

export default function ProLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCar = pathname.includes('/pro/voiture')
  const isRestaurant = pathname.includes('/pro/restaurant')
  
  let redirectUrl = '/auth/pro/hotel'
  if (isCar) redirectUrl = '/auth/pro/voiture'
  if (isRestaurant) redirectUrl = '/auth/pro/restaurant'

  if (isCar) {
    return (
      <AuthGuard redirectUrl={redirectUrl} allowedRoles={['TENANT_ADMIN', 'TENANT_EMPLOYEE']}>
        <DashboardShell
          navItems={carItems}
          userTitle="Gérant d'Agence Auto" 
          sidebarBg="bg-white"
          sidebarText="text-gray-600"
          activeClass="bg-slate-900 text-white font-bold shadow-sm"
          hoverClass="hover:bg-gray-50"
        >
          {children}
        </DashboardShell>
      </AuthGuard>
    )
  }

  if (isRestaurant) {
    return (
      <AuthGuard redirectUrl={redirectUrl} allowedRoles={['TENANT_ADMIN', 'TENANT_EMPLOYEE']}>
        <DashboardShell
          navItems={restaurantItems}
          userTitle="Gérant de Restaurant" 
          sidebarBg="bg-amber-900"
          sidebarText="text-amber-50"
          activeClass="bg-white text-amber-900 font-bold shadow-sm"
          hoverClass="hover:bg-amber-800 hover:text-white"
        >
          {children}
        </DashboardShell>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard redirectUrl={redirectUrl} allowedRoles={['TENANT_ADMIN', 'TENANT_EMPLOYEE']}>
      <DashboardShell
        navItems={hotelItems}
        userTitle="Gérant d'Hôtel" 
        sidebarBg="bg-secondary"
        sidebarText="text-orange-50"
        activeClass="bg-white text-secondary font-bold shadow-sm"
        hoverClass="hover:bg-secondary-600 hover:text-white"
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  )
}
