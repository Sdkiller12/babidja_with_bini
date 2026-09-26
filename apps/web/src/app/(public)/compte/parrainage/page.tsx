'use client';

import { useState } from 'react';
import { Gift, Copy, Check, Users, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { fetchMyReferrals, type Referral } from '@/lib/api/referrals';
import { fcfa } from '@/utils/formatters';

export default function Parrainage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { data: referrals = [], isLoading } = useQuery<Referral[]>({
    queryKey: ['my-referrals'],
    queryFn: fetchMyReferrals,
  });

  const referralCode = user?.referralCode || '----';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRewards = referrals
    .filter((r: Referral) => r.rewardStatus === 'CREDITED')
    .reduce((acc: number, curr: Referral) => acc + Number(curr.rewardAmount), 0);

  const pendingCount = referrals.filter((r: Referral) => r.rewardStatus === 'PENDING').length;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold mb-6">Système de parrainage</h1>

      <section className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Code de parrainage */}
        <div className="flex-1 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-sm mb-4">
            <Gift className="size-6" />
          </span>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Votre code de parrainage</h2>
          <p className="text-sm text-gray-600 mb-6">Partagez ce code avec vos amis. Vous recevrez une récompense sur votre solde dès leur première réservation confirmée.</p>
          
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-xl border-2 border-dashed border-primary/50 bg-white px-6 py-3 text-2xl font-black text-primary tracking-widest">
              {referralCode}
            </div>
            <Button variant="secondary" className="h-13 px-4" onClick={handleCopy} aria-label="Copier le code">
              {copied ? <Check className="size-5 text-green-600" /> : <Copy className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="flex flex-col gap-4 w-full md:w-64 shrink-0">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex items-center gap-4">
            <div className="grid size-10 place-items-center rounded-full bg-green-100 text-green-600">
              <Gift className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Gains totaux</p>
              <p className="text-lg font-extrabold text-gray-900">{fcfa(totalRewards)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex items-center gap-4">
            <div className="grid size-10 place-items-center rounded-full bg-orange-100 text-[#e97c2a]">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">En attente</p>
              <p className="text-lg font-extrabold text-gray-900">{pendingCount} filleul(s)</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Historique de vos filleuls</h2>
        
        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-400 animate-pulse">Chargement...</div>
        ) : referrals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
            <Users className="mx-auto size-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">Vous n&apos;avez encore parrainé personne.</p>
            <p className="text-gray-400 text-xs mt-1">Partagez votre code pour commencer à cumuler des gains.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-4 py-3 font-semibold">Filleul</th>
                  <th className="px-4 py-3 font-semibold">Date d&apos;inscription</th>
                  <th className="px-4 py-3 font-semibold">Récompense</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referrals.map((r: Referral) => (
                  <tr key={r.id} className="bg-white">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {r.referred?.firstName || r.referred?.lastName 
                        ? `${r.referred.firstName} ${r.referred.lastName}`.trim()
                        : 'Utilisateur'}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 font-bold">{fcfa(Number(r.rewardAmount))}</td>
                    <td className="px-4 py-4">
                      {r.rewardStatus === 'CREDITED' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          <Check className="size-3" /> Créditée
                        </span>
                      )}
                      {r.rewardStatus === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          <AlertCircle className="size-3" /> En attente de réservation
                        </span>
                      )}
                      {r.rewardStatus === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <AlertCircle className="size-3" /> Annulée
                        </span>
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
