'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMyApplicationStatus } from '@/lib/api/partners';
import { Loader2, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PartnerDashboardPage() {
  const router = useRouter();

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['my-partner-applications'],
    queryFn: fetchMyApplicationStatus,
    retry: false,
  });

  // If unauthorized, the fetch will fail or we can redirect
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Veuillez vous connecter</h2>
          <p className="text-gray-500 mb-6">Connectez-vous pour suivre l'état de votre candidature.</p>
          <Button onClick={() => router.push('/connexion')} className="w-full">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: <Clock className="h-6 w-6 text-yellow-500" />, title: 'Candidature en attente', color: 'bg-yellow-50', text: 'text-yellow-700' };
      case 'UNDER_REVIEW':
        return { icon: <FileText className="h-6 w-6 text-blue-500" />, title: 'En cours d\'examen', color: 'bg-blue-50', text: 'text-blue-700' };
      case 'APPROVED':
        return { icon: <CheckCircle2 className="h-6 w-6 text-green-500" />, title: 'Candidature approuvée', color: 'bg-green-50', text: 'text-green-700' };
      case 'REJECTED':
        return { icon: <XCircle className="h-6 w-6 text-red-500" />, title: 'Candidature rejetée', color: 'bg-red-50', text: 'text-red-700' };
      case 'NEEDS_INFO':
        return { icon: <AlertCircle className="h-6 w-6 text-orange-500" />, title: 'Informations requises', color: 'bg-orange-50', text: 'text-orange-700' };
      default:
        return { icon: <Clock className="h-6 w-6" />, title: status, color: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Espace Partenaire
            </h1>
            <p className="mt-2 text-gray-600">
              Suivez l'état de vos candidatures d'onboarding sur Babydja.
            </p>
          </div>
          <Link href="/partners/apply">
            <Button variant="outline">Nouvelle candidature</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune candidature</h3>
            <p className="text-gray-500 mb-6">Vous n'avez soumis aucune candidature d'onboarding pour le moment.</p>
            <Link href="/partners/apply">
              <Button>Devenir partenaire</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => {
              const display = getStatusDisplay(app.status);
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${display.color}`}>
                    {display.icon}
                    <h3 className={`font-semibold ${display.text}`}>{display.title}</h3>
                  </div>
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Entreprise</p>
                        <p className="mt-1 font-medium text-gray-900">{app.businessName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Type de service</p>
                        <p className="mt-1 text-gray-900">{app.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date de soumission</p>
                        <p className="mt-1 text-gray-900">{new Date(app.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Documents</p>
                        <p className="mt-1 text-gray-900 flex gap-2">
                          <a href={app.idDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ID</a>
                          <span>•</span>
                          <a href={app.legalDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Légal</a>
                        </p>
                      </div>
                    </div>
                    
                    {app.reviewNotes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <span className="font-semibold block mb-1">Note de l'équipe :</span>
                        {app.reviewNotes}
                      </div>
                    )}

                    {app.status === 'APPROVED' && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-3">
                          Félicitations ! Votre compte partenaire a été activé. Vous pouvez maintenant accéder à votre espace de gestion (Tenant).
                        </p>
                        <Link href={`/pro/${app.serviceType.toLowerCase()}/dashboard`}>
                          <Button>
                            Accéder à mon espace de gestion <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
