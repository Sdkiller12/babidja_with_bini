'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminTenants, deleteAdminTenant } from '@/lib/api/admin'
import { Building2, Car, Loader2, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function AdminEtablissements() {
  const queryClient = useQueryClient()
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: fetchAdminTenants,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminTenant,
    onSuccess: () => {
      toast.success('Établissement supprimé avec succès.')
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de l\'établissement.')
    }
  })

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'établissement "${name}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Gestion des établissements</h1>
          <p className="mt-1 text-sm text-gray-500">Liste des hôtels et agences partenaires inscrits sur la plateforme.</p>
        </div>
        <Button size="sm" className="min-h-[44px] w-full sm:w-auto">
          <Plus className="size-4 mr-2 shrink-0" />
          Ajouter manuellement
        </Button>
      </div>

      <section className="mt-6 min-w-0 overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : tenants.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Aucun établissement enregistré pour le moment.</p>
        ) : (
          <table className="w-full min-w-[37.5rem] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-5 py-3 font-semibold">Établissement</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Localisation</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {tenant.name}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {tenant.type === 'HOTEL' ? (
                      <span className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full w-max">
                        <Building2 className="size-3.5" /> Hôtellerie
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#e97c2a] font-semibold bg-orange-50 px-2.5 py-1 rounded-full w-max">
                        <Car className="size-3.5" /> Véhicules
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {tenant.city}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={tenant.isActive ? 'success' : 'danger'}>
                      {tenant.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(tenant.id, tenant.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
