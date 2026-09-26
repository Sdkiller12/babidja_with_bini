'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, Building2, MapPin, Mail, Phone, ChefHat, Car, BedDouble, Loader2 } from 'lucide-react';
import http from '@/lib/http';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminDemandes() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading } = useQuery({
    queryKey: ['admin-tenant-requests'],
    queryFn: async () => {
      const { data } = await http.get('/admin/tenant-requests');
      return data as Record<string, any>[];
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      const { data } = await http.patch(`/admin/tenant-requests/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenant-requests'] });
    },
    onError: () => {
      alert("Une erreur est survenue.");
    }
  });

  const handleProcess = (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Êtes-vous sûr de vouloir ${status === 'APPROVED' ? 'approuver' : 'rejeter'} cette demande ?`)) return;
    processMutation.mutate({ id, status });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'HOTEL': return <BedDouble className="size-5" />;
      case 'CAR_RENTAL': return <Car className="size-5" />;
      case 'RESTAURANT': return <ChefHat className="size-5" />;
      default: return <Building2 className="size-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="success"><CheckCircle2 className="size-3 mr-1"/> Approuvée</Badge>;
      case 'REJECTED': return <Badge variant="warning"><XCircle className="size-3 mr-1"/> Rejetée</Badge>;
      default: return <Badge variant="secondary"><Clock className="size-3 mr-1"/> En attente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Demandes Partenaires</h1>
        <p className="text-gray-500 text-sm mt-1">Examinez et validez les demandes d&apos;inscription des nouveaux partenaires.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Chargement...</div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center text-gray-500 border border-dashed border-gray-200 rounded-3xl">
          Aucune demande partenaire pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => (
            <div key={req.id as string} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(req.status as string)}
                    <span className="text-sm font-semibold text-gray-400">
                      {new Date(req.createdAt as string).toLocaleDateString('fr-FR')}
                    </span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-primary">{getIcon(req.type as string)}</span>
                    {req.companyName as string}
                 </h3>
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-gray-400" /> {req.city as string} - {req.address as string}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-gray-400" /> {req.contactEmail as string}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-gray-400" /> {req.contactPhone as string}
                    </div>
                 </div>
               </div>
               
               {req.status === 'PENDING' && (
                 <div className="flex flex-col gap-3 min-w-35">
                   <Button onClick={() => handleProcess(req.id as string, 'APPROVED')} className="w-full bg-green-600 hover:bg-green-700">
                     Approuver
                   </Button>
                   <Button onClick={() => handleProcess(req.id as string, 'REJECTED')} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                     Rejeter
                   </Button>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
