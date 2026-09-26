'use client';

import { Network, Coins, Users, CircleHelp, Building2, Car, CalendarDays, type LucideIcon, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminDashboard } from '@/lib/api/admin'
import { fcfa } from '@/utils/formatters'

const kpiColor: Record<string, string> = { primary: 'bg-primary', secondary: 'bg-secondary', danger: 'bg-danger', info: 'bg-blue-500' }
const kpiIcons: Record<string, LucideIcon> = { network: Network, coins: Coins, users: Users, building: Building2, car: Car, calendar: CalendarDays, help: CircleHelp }

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const kpis = [
    { id: 'revenue', label: 'Chiffre d\'affaires total', value: fcfa(stats?.totalRevenue ?? 0), icon: 'coins', color: 'primary' },
    { id: 'users', label: 'Utilisateurs (Clients)', value: stats?.customersCount?.toString() || '0', icon: 'users', color: 'secondary' },
    { id: 'bookings', label: 'Réservations totales', value: stats?.totalBookings?.toString() || '0', icon: 'calendar', color: 'info' },
    { id: 'hotels', label: 'Hôtels partenaires', value: stats?.hotelsCount?.toString() || '0', icon: 'building', color: 'danger' },
    { id: 'cars', label: 'Agences de véhicules', value: stats?.carRentalsCount?.toString() || '0', icon: 'car', color: 'primary' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold">Paramètres techniques & d&apos;administration globale</h1>
      <p className="mt-2 text-sm text-gray-600">
        Espace réservé à l&apos;administrateur système pour la vue globale de la plateforme.
      </p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4 sm:grid-cols-2">
        {kpis.map((kpi) => {
          const Icon = kpiIcons[kpi.icon] || CircleHelp
          return (
            <div key={kpi.id} className={`flex items-center justify-between gap-3 rounded-2xl p-5 text-white ${kpiColor[kpi.color] || 'bg-gray-500'}`}>
              <div>
                <p className="text-xs font-medium text-white/90">{kpi.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{kpi.value}</p>
              </div>
              <Icon className="size-9 shrink-0 text-white/70" />
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Aucune alerte technique</h2>
        <p className="mt-2">Le système est stable. Les sauvegardes sont à jour.</p>
      </div>
    </div>
  )
}
