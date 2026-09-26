'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminCommissions, Commission } from '@/lib/api/admin';
import { Loader2, DollarSign, Activity, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { fcfa as formatCurrency } from '@/utils/formatters';

export default function AdminCommissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => fetchAdminCommissions(),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const { items = [], totals } = data || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">Moteur de Commissions</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d&apos;ensemble des commissions sur les partenaires externes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Activity className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Volume Brut (Partenaires)</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totals?.totalGross ?? 0)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <DollarSign className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Commissions Totales (Générées)</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totals?.totalCommission ?? 0)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <Wallet className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">À recouvrer / En attente</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totals?.pendingCommission ?? 0)}</h3>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune commission enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                  <th className="px-5 py-4 font-semibold">Référence</th>
                  <th className="px-5 py-4 font-semibold">Partenaire</th>
                  <th className="px-5 py-4 font-semibold text-right">Montant Brut</th>
                  <th className="px-5 py-4 font-semibold text-right">Taux / Frais</th>
                  <th className="px-5 py-4 font-semibold text-right">Commission</th>
                  <th className="px-5 py-4 font-semibold text-right">Net Partenaire</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Statut Reversement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((commission: Commission) => (
                  <tr key={commission.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {commission.bookingRef}
                      <span className="block text-xs text-gray-500 font-normal">{commission.bookingType}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {commission.tenant?.name}
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      {formatCurrency(Number(commission.grossAmount))}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-500">
                      {Number(commission.commissionRate)}
                      {commission.bookingType === 'FLIGHT' ? ' FCFA' : '%'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-green-600">
                      {formatCurrency(Number(commission.commissionAmount))}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-700">
                      {formatCurrency(Number(commission.netAmount))}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(commission.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {commission.payoutStatus === 'PAID' ? (
                        <Badge variant="success">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Payé
                          </span>
                        </Badge>
                      ) : (
                        <Badge variant="warning">En attente</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
