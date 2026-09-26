'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenantReservations, updateTenantReservationStatus } from '@/lib/api/restaurants';
import { useAuthStore as useAuth } from '@/store/useAuthStore';
import { Loader2, Calendar, Clock, Users, Check, X, Coffee } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

type ReservationType = {
  id: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: string;
  user?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
};

export default function RestaurantReservationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['restaurant-reservations', user?.tenantId],
    queryFn: () => getTenantReservations(user!.tenantId!),
    enabled: !!user?.tenantId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateTenantReservationStatus(user!.tenantId!, id, status),
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['restaurant-reservations', user?.tenantId] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Réservations de tables</h1>
        <p className="text-gray-500">Gérez les réservations de votre restaurant en temps réel.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {reservations.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="mx-auto size-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune réservation</h3>
            <p className="mt-2 text-gray-500">Les réservations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                  <th className="px-5 py-4 font-semibold">Client</th>
                  <th className="px-5 py-4 font-semibold">Date & Heure</th>
                  <th className="px-5 py-4 font-semibold text-center">Couverts</th>
                  <th className="px-5 py-4 font-semibold">Statut</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((res: ReservationType) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {res.user?.firstName} {res.user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{res.user?.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <span>{new Date(res.reservationDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="size-4 text-gray-400" />
                        <span>{res.reservationTime}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center justify-center bg-gray-100 text-gray-800 rounded-full h-8 px-3 font-bold">
                        <Users className="size-4 mr-1.5" />
                        {res.partySize}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {res.status === 'PENDING' && <Badge variant="warning">En attente</Badge>}
                      {res.status === 'CONFIRMED' && <Badge variant="success">Confirmé</Badge>}
                      {res.status === 'CANCELLED' && <Badge variant="danger">Annulé</Badge>}
                      {res.status === 'COMPLETED' && <Badge variant="default">Terminé</Badge>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: res.id, status: 'CONFIRMED' })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirmer"
                            >
                              <Check className="size-5" />
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: res.id, status: 'CANCELLED' })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Refuser"
                            >
                              <X className="size-5" />
                            </button>
                          </>
                        )}
                        {res.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: res.id, status: 'COMPLETED' })}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Marquer terminé
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
