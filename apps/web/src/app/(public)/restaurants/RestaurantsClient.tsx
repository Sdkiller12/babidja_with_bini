'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurants, Restaurant } from '@/lib/api/restaurants';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, MapPin, Utensils } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Pagination from '@/components/ui/Pagination';


export default function RestaurantsClient() {
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedCityFilter = useDebounce(cityFilter, 500);
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['restaurants', debouncedCityFilter, page],
    queryFn: () => getRestaurants({ city: debouncedCityFilter || undefined, page, limit: 12 }),
  });

  const restaurants = response?.data || [];
  const meta = response?.meta;

  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-clip bg-gray-50 pb-12">
      <div className="relative bg-gray-900 px-4 py-12 sm:py-20 sm:px-6 lg:px-8 text-center text-white overflow-hidden">
        <h1 className="text-balance text-[clamp(1.875rem,6vw,3.75rem)] font-extrabold tracking-tight">Restaurants</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base sm:text-xl text-gray-300">
          Découvrez les meilleures tables et réservez en quelques clics
        </p>
      </div>

      <main className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search Bar */}
        <div className="mb-8 sm:mb-10 rounded-2xl bg-white p-4 shadow-lg sm:p-6 border border-gray-100 flex min-w-0 flex-col sm:flex-row gap-4 sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <div className="relative min-w-0">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Ex: Abidjan, Yamoussoukro..."
                className="w-full min-w-0 pl-10 pr-4 py-3 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Utensils className="mx-auto size-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun restaurant trouvé</h3>
            <p className="mt-2 text-gray-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant: Restaurant) => (
              <Link 
                key={restaurant.id} 
                href={`/restaurants/${restaurant.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  {restaurant.tenant?.coverImageUrl ? (
                    <Image
                      src={restaurant.tenant.coverImageUrl}
                      alt={restaurant.tenant.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <Utensils className="size-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                    {restaurant.priceRange}
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{restaurant.tenant?.name}</h3>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="mr-1.5 size-4 shrink-0" />
                    <span className="line-clamp-1">{restaurant.tenant?.city} — {restaurant.tenant?.address}</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {restaurant.cuisineType.slice(0, 3).map((cuisine: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">
                        {cuisine}
                      </span>
                    ))}
                    {restaurant.cuisineType.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        +{restaurant.cuisineType.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta && meta.lastPage > 1 && (
          <Pagination 
            currentPage={page} 
            lastPage={meta.lastPage} 
            onPageChange={setPage} 
          />
        )}
      </main>
    </div>
  );
}
