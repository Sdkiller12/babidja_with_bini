'use client';

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Settings2, ShieldCheck, Fuel } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCars } from '@/lib/api/catalog'
import type { Vehicle } from '@/types/catalog'
import CarBookingSidebar from '@/components/car/CarBookingSidebar'
import Placeholder from '@/components/Placeholder'
import BackButton from '@/components/ui/BackButton'

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6">
      <div className="mb-4 h-4 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded-3xl bg-gray-200 sm:h-96" />
      <div className="mt-8 h-8 w-2/3 rounded bg-gray-200" />
      <div className="mt-4 flex gap-3">
        <div className="h-7 w-28 rounded-full bg-gray-100" />
        <div className="h-7 w-28 rounded-full bg-gray-100" />
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default function CarDetail() {
  const { id } = useParams()
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  })

  if (isLoading) return <DetailSkeleton />

  const car = cars.find((c: Vehicle) => c.id === id) ?? cars[0]

  if (!car) return <div className="p-8 text-center">Voiture non trouvée.</div>

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl overflow-x-clip px-4 py-6 pb-44 sm:px-6 md:pb-10">
      <BackButton href="/voitures" className="mb-4" />
      {/* Fil d'ariane */}
      <nav className="text-sm text-gray-500 mb-4 flex min-w-0 flex-wrap items-center gap-1.5">
        <Link href="/" className="shrink-0 hover:text-secondary">Accueil</Link>
        <span aria-hidden="true">›</span>
        <Link href="/voitures" className="shrink-0 hover:text-secondary">Location de voitures</Link>
        <span aria-hidden="true">›</span>
        <span className="min-w-0 truncate font-medium text-ink">{car.name}</span>
      </nav>

      {/* Image principale */}
      <div className="relative h-60 sm:h-80 md:h-96 lg:h-[31.25rem] min-w-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-gray-200 bg-white">
        {car.images && car.images.length > 0 ? (
          <Image src={car.images[0]} alt={car.name} fill priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 64rem" className="object-cover transition-transform duration-700 hover:scale-105" />
        ) : (
          <Placeholder kind={car.kind || 'car'} className="h-full w-full" />
        )}
      </div>

      <div className="mt-8 flex min-w-0 flex-col items-stretch justify-between gap-6 md:flex-row md:gap-8">
        {/* Détails Principaux */}
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-2xl sm:text-3xl font-extrabold text-gray-900 md:text-4xl">{car.name}</h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <Settings2 className="size-4 text-primary" />
              {car.transmission}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <ShieldCheck className="size-4 text-primary" />
              Assurance incluse
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <Fuel className="size-4 text-primary" />
              Plein à rendre
            </span>
          </div>

          <section className="mt-8 min-w-0 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary/20 inline-block">Description</h2>
            <p className="mt-3 leading-relaxed text-gray-600 text-base sm:text-lg break-words">
              {car.description}
            </p>
          </section>
        </div>

        <CarBookingSidebar car={car} />
      </div>
    </div>
  )
}
