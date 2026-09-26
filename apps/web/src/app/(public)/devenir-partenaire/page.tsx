'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, ChefHat, Car, BedDouble, CheckCircle2, TrendingUp, Handshake, ChevronRight, Home } from 'lucide-react';
import http from '@/lib/http';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function DevenirPartenairePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    type: 'HOTEL',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    address: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await http.post('/tenants/apply', formData);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-inner border border-green-200">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Félicitations, Demande Envoyée !</h1>
        <p className="text-xl text-gray-600 max-w-lg mb-8">
          Merci de votre intérêt pour Babydja. Notre équipe étudiera votre dossier et vous contactera très prochainement.
        </p>
        <Link href="/">
           <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      {/* Hero Header B2B */}
      <div className="relative bg-linear-to-r from-gray-900 to-gray-800 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Fil d'ariane */}
          <nav className="flex items-center text-sm font-medium text-gray-300 mb-8">
            <Link href="/" className="hover:text-white flex items-center gap-1">
              <Home className="size-4" /> Accueil
            </Link>
            <ChevronRight className="size-4 mx-2" />
            <span className="text-white">Devenir Partenaire</span>
          </nav>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Propulsez votre <span className="text-primary">Business</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Rejoignez le réseau Babydja. Hôtels, agences de location ou restaurants, digitalisez vos réservations et augmentez vos revenus.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Section Argumentaire (Left) */}
          <div className="lg:w-5/12 pt-8 lg:pt-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Pourquoi nous rejoindre ?</h2>
            <div className="space-y-8">
               <div className="flex gap-4">
                 <div className="shrink-0 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                   <TrendingUp className="size-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">Visibilité Accrue</h3>
                   <p className="mt-2 text-gray-600">Accédez à une base de clients de plus en plus large en Côte d&apos;Ivoire et à l&apos;international.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="shrink-0 grid size-12 place-items-center rounded-xl bg-secondary/10 text-secondary">
                   <Building2 className="size-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">Outils de Gestion</h3>
                   <p className="mt-2 text-gray-600">Bénéficiez d&apos;un tableau de bord moderne pour suivre vos réservations, vos paiements et vos statistiques.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="shrink-0 grid size-12 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
                   <Handshake className="size-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">Paiements Sécurisés</h3>
                   <p className="mt-2 text-gray-600">Encaissez vos acomptes facilement grâce à nos intégrations Mobile Money et cartes bancaires.</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Formulaire (Right) */}
          <div className="lg:w-7/12 w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl ring-1 ring-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Soumettre votre établissement</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Type d&apos;établissement</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'HOTEL' })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.type === 'HOTEL' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <BedDouble className="w-5 h-5" />
                        <span className="text-xs font-semibold">Hôtel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'CAR_RENTAL' })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.type === 'CAR_RENTAL' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <Car className="w-5 h-5" />
                        <span className="text-xs font-semibold">Auto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'RESTAURANT' })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.type === 'RESTAURANT' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <ChefHat className="w-5 h-5" />
                        <span className="text-xs font-semibold">Resto</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nom de l&apos;entreprise</label>
                    <Input
                      required
                      icon={Building2}
                      placeholder="Ex: Ivoire Lodge"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nom du gérant</label>
                    <Input
                      required
                      placeholder="Ex: Jean Dupont"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email de contact</label>
                    <Input
                      required
                      type="email"
                      icon={Mail}
                      placeholder="jean@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Téléphone</label>
                    <Input
                      required
                      type="tel"
                      icon={Phone}
                      placeholder="Ex: +225 0123456789"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Ville</label>
                    <Input
                      required
                      icon={MapPin}
                      placeholder="Ex: Abidjan, Cocody"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Adresse complète</label>
                  <Input
                    required
                    placeholder="Ex: Rue des Jardins, Immeuble..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description (Optionnel)</label>
                  <textarea
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    rows={4}
                    placeholder="Parlez-nous brièvement de votre établissement..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full text-lg py-6 mt-4 shadow-xl shadow-primary/20">
                  {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
