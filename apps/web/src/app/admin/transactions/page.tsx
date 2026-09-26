'use client';

import { ChevronDown, Loader2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import PaymentLogo from '@/components/PaymentLogo'
import { fcfa } from '@/utils/formatters'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminTransactions, type AdminTransaction } from '@/lib/api/admin'

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = { SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'danger' }

export default function AdminTransactions() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: fetchAdminTransactions,
  })

  const totalAmount = transactions
    .filter((t: AdminTransaction) => t.status === 'SUCCESS')
    .reduce((acc: number, curr: AdminTransaction) => acc + Number(curr.amount), 0)

  return (
    <div className="w-full min-w-0">
      <h1 className="text-balance text-lg sm:text-xl font-bold">Suivi des transactions système</h1>

      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">Période :</span>
        <button className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2">
          Toutes <ChevronDown className="size-4 shrink-0" />
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-secondary p-4 sm:p-5 text-center text-white">
        <p className="text-sm font-medium">Total transactions encaissées</p>
        <p className="mt-1 break-words text-2xl sm:text-3xl font-extrabold">{fcfa(totalAmount)}</p>
      </div>

      <section className="mt-4 min-w-0 overflow-x-auto rounded-2xl bg-white p-3 sm:p-5 shadow-sm">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Aucune transaction trouvée.</p>
        ) : (
          <table className="w-full min-w-[50rem] whitespace-nowrap text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-2 font-semibold">Client</th>
                <th className="py-2 font-semibold">Service réservé</th>
                <th className="py-2 font-semibold">Montant</th>
                <th className="py-2 font-semibold">Date d&apos;ajout</th>
                <th className="py-2 font-semibold">Méthode</th>
                <th className="py-2 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: AdminTransaction) => {
                const clientName = t.booking?.user 
                  ? `${t.booking.user.firstName} ${t.booking.user.lastName}`.trim() || t.booking.user.email
                  : 'Inconnu';
                const serviceName = t.booking?.tenant?.name || 'Inconnu';
                const date = new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium">{clientName}</td>
                    <td className="py-3 text-gray-500">{serviceName}</td>
                    <td className="py-3 font-semibold">{fcfa(Number(t.amount))}</td>
                    <td className="py-3 text-gray-500">{date}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5">
                        <PaymentLogo method={t.method} className="h-6 w-9" />
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant[t.status] ?? 'warning'}>
                        {t.status === 'SUCCESS' ? 'Payé' : t.status === 'PENDING' ? 'En attente' : t.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
