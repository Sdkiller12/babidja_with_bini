'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminPartnerApplications, updateAdminPartnerApplicationStatus } from '@/lib/api/admin'
import { Building2, Car, Loader2, Check, X, FileText, UtensilsCrossed, Briefcase } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PartnerApplication } from '@/lib/api/partners'
import toast from 'react-hot-toast'

export default function AdminPartnerApplications() {
  const queryClient = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-partner-applications'],
    queryFn: fetchAdminPartnerApplications,
  })

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateAdminPartnerApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-applications'] })
      toast.success('Statut mis à jour avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">En attente</Badge>
      case 'UNDER_REVIEW': return <Badge variant="info">En cours</Badge>
      case 'APPROVED': return <Badge variant="success">Approuvé</Badge>
      case 'REJECTED': return <Badge variant="danger">Rejeté</Badge>
      case 'NEEDS_INFO': return <Badge variant="warning">Info requise</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'HOTEL':
        return (
          <span className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full w-max">
            <Building2 className="size-3.5" /> Hôtellerie
          </span>
        )
      case 'CAR_RENTAL':
        return (
          <span className="flex items-center gap-1.5 text-[#e97c2a] font-semibold bg-orange-50 px-2.5 py-1 rounded-full w-max">
            <Car className="size-3.5" /> Véhicules
          </span>
        )
      case 'RESTAURANT':
        return (
          <span className="flex items-center gap-1.5 text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-full w-max">
            <UtensilsCrossed className="size-3.5" /> Restaurant
          </span>
        )
      case 'AGENCY':
        return (
          <span className="flex items-center gap-1.5 text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-full w-max">
            <Briefcase className="size-3.5" /> Agence
          </span>
        )
      default:
        return <span>{type}</span>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Candidatures Partenaires (KYC)</h1>
          <p className="mt-1 text-sm text-gray-500">Examinez et validez les nouvelles demandes d'onboarding.</p>
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Aucune candidature pour le moment.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-5 py-3 font-semibold">Entreprise</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Documents</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app: PartnerApplication) => (
                <tr key={app.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    <p>{app.businessName}</p>
                    <p className="text-xs text-gray-500 font-normal">Contact: {app.contactPhone} / {app.contactEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    {getTypeBadge(app.serviceType)}
                  </td>
                  <td className="px-5 py-4 text-gray-500 flex items-center gap-2">
                    <a href={app.idDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                      <FileText className="size-3" /> ID
                    </a>
                    <a href={app.legalDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                      <FileText className="size-3" /> Légal
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-5 py-4 flex gap-2">
                    {app.status !== 'APPROVED' && (
                      <Button 
                        size="sm" 
                        variant="primary"
                        disabled={isPending}
                        onClick={() => updateStatus({ id: app.id, status: 'APPROVED' })}
                      >
                        <Check className="size-4 mr-1" />
                        Approuver
                      </Button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => updateStatus({ id: app.id, status: 'REJECTED' })}
                      >
                        <X className="size-4 mr-1" />
                        Rejeter
                      </Button>
                    )}
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
