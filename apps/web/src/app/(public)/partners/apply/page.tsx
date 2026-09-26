'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { applyForPartnership } from '@/lib/api/partners';
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const applySchema = z.object({
  businessName: z.string().min(2, "Le nom de l'entreprise est requis"),
  serviceType: z.enum(['HOTEL', 'CAR_RENTAL', 'RESTAURANT', 'AGENCY'], {
    message: "Le type de service est requis",
  }),
  registryNumber: z.string().min(2, "Le numéro de registre est requis"),
  contactPhone: z.string().min(8, "Le numéro de téléphone est invalide"),
  contactEmail: z.string().email("L'adresse email est invalide"),
  legalDoc: z.any()
    .refine((files) => files?.length === 1, "Le document légal est requis.")
    .refine((files) => files?.[0]?.size <= 5000000, "La taille max est de 5MB."),
  idDoc: z.any()
    .refine((files) => files?.length === 1, "La pièce d'identité est requise.")
    .refine((files) => files?.[0]?.size <= 5000000, "La taille max est de 5MB."),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function ApplyPartnershipPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
  });

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      const formData = new FormData();
      formData.append('businessName', data.businessName);
      formData.append('serviceType', data.serviceType);
      formData.append('registryNumber', data.registryNumber);
      formData.append('contactPhone', data.contactPhone);
      formData.append('contactEmail', data.contactEmail);
      formData.append('legalDoc', data.legalDoc[0]);
      formData.append('idDoc', data.idDoc[0]);

      await applyForPartnership(formData);
      setIsSuccess(true);
      toast.success('Votre candidature a été soumise avec succès !');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la soumission.');
      console.error(error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidature envoyée !</h2>
          <p className="text-gray-500 mb-6">
            Notre équipe va étudier votre demande (KYC). Vous recevrez un SMS dès que votre compte sera activé.
          </p>
          <Link href="/">
            <Button className="w-full">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Devenez Partenaire Babydja
          </h1>
          <p className="mt-2 text-gray-600">
            Rejoignez la première marketplace de réservation en Côte d&apos;Ivoire.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de l&apos;entreprise</label>
              <div className="mt-1">
                <input
                  {...register('businessName')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Ex: Ivoire Hôtels"
                />
                {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type de service</label>
              <div className="mt-1">
                <select
                  {...register('serviceType')}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="HOTEL">Hôtel & Hébergement</option>
                  <option value="CAR_RENTAL">Location de véhicules</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="AGENCY">Agence de voyage</option>
                </select>
                {errors.serviceType && <p className="mt-1 text-sm text-red-600">{errors.serviceType.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de Registre de Commerce (RCCM)</label>
              <div className="mt-1">
                <input
                  {...register('registryNumber')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                {errors.registryNumber && <p className="mt-1 text-sm text-red-600">{errors.registryNumber.message as string}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone Mobile</label>
                <div className="mt-1">
                  <input
                    {...register('contactPhone')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="+2250102030405"
                  />
                  {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message as string}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    {...register('contactEmail')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message as string}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Documents justificatifs</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Document légal (DFE, RCCM...)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Télécharger un fichier</span>
                        <input type="file" className="sr-only" {...register('legalDoc')} accept=".pdf,.png,.jpg,.jpeg" />
                      </label>
                    </div>
                  </div>
                </div>
                {errors.legalDoc && <p className="mt-1 text-sm text-red-600">{errors.legalDoc.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pièce d&apos;identité du gérant</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Télécharger un fichier</span>
                        <input type="file" className="sr-only" {...register('idDoc')} accept=".pdf,.png,.jpg,.jpeg" />
                      </label>
                    </div>
                  </div>
                </div>
                {errors.idDoc && <p className="mt-1 text-sm text-red-600">{errors.idDoc.message as string}</p>}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Soumission en cours...
                  </>
                ) : (
                  'Soumettre la candidature'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
