'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRestaurant, createReservation, CreateTableReservationDto, MenuCategory, MenuItem } from '@/lib/api/restaurants';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, MapPin, Clock, Users, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fcfa as formatCurrency } from '@/utils/formatters';
import { useAuthStore as useAuth } from '@/store/useAuthStore';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  const { user } = useAuth();
  
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  });

  const reserveMutation = useMutation({
    mutationFn: (data: CreateTableReservationDto) => createReservation(restaurantId, data),
    onSuccess: () => {
      toast.success('Réservation envoyée avec succès !');
      router.push('/compte/reservations');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la réservation');
    },
  });

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Veuillez vous connecter pour réserver');
      router.push('/auth');
      return;
    }
    
    if (!reservationDate || !reservationTime || partySize <= 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    reserveMutation.mutate({
      reservationDate: new Date(reservationDate).toISOString(),
      reservationTime,
      partySize: Number(partySize),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-500">Restaurant introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-clip bg-gray-50 pb-28 md:pb-20">
      {/* Hero Image */}
      <div className="relative h-60 sm:h-72 md:h-96 w-full min-w-0 bg-gray-200">
        {restaurant.tenant?.coverImageUrl && (
          <Image
            src={restaurant.tenant.coverImageUrl}
            alt={restaurant.tenant.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 max-w-7xl mx-auto min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {restaurant.cuisineType.map((cuisine: string, idx: number) => (
              <span key={idx} className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-white/30 whitespace-nowrap">
                {cuisine}
              </span>
            ))}
          </div>
          <h1 className="text-balance text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 break-words">{restaurant.tenant?.name}</h1>
          <div className="flex min-w-0 items-center text-white/90 text-sm sm:text-base">
            <MapPin className="size-5 mr-2 shrink-0" />
            <span className="truncate">{restaurant.tenant?.address}, {restaurant.tenant?.city}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Content (Menu) */}
        <div className="min-w-0 lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="min-w-0 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">À propos</h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {restaurant.tenant?.description || "Aucune description disponible pour le moment."}
            </p>
          </div>

          <div className="min-w-0 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
            {restaurant.tenant?.menuCategories && restaurant.tenant.menuCategories.length > 0 ? (
              <div className="space-y-8">
                {restaurant.tenant.menuCategories.map((cat: MenuCategory) => (
                  <div key={cat.id}>
                    <h3 className="text-xl font-bold text-primary-800 mb-4 pb-2 border-b border-gray-100">{cat.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cat.items.filter((i: MenuItem) => i.isAvailable).map((item: MenuItem) => (
                        <div key={item.id} className="flex flex-col p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary-200 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <span className="font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md text-sm whitespace-nowrap ml-2">
                              {formatCurrency(Number(item.price))}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Le menu n&apos;est pas encore disponible en ligne.</p>
            )}
          </div>
        </div>

        {/* Sidebar (Booking form) */}
        <div className="min-w-0 lg:col-span-1">
          <div className="lg:sticky lg:top-24 min-w-0 bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Réserver une table</h2>
            
            <form onSubmit={handleReserve} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline-block size-4 mr-1 text-gray-400" /> Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline-block size-4 mr-1 text-gray-400" /> Heure
                </label>
                <input
                  type="time"
                  required
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline-block size-4 mr-1 text-gray-400" /> Couverts
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={reserveMutation.isPending}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {reserveMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>Demander une réservation</>
                  )}
                </button>
              </div>
              
              <div className="flex items-start gap-2 mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                <p>Pas de paiement requis à l&apos;avance. Vous paierez sur place après votre repas.</p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
