'use client';

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Users, LayoutTemplate } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchRooms } from '@/lib/api/catalog'
import type { Room } from '@/types/catalog'
import RoomGallery from '@/components/room/RoomGallery'
import RoomAmenities from '@/components/room/RoomAmenities'
import BookingSidebar from '@/components/room/BookingSidebar'
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

export default function RoomDetail() {
  const { id } = useParams()
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  })

  if (isLoading) return <DetailSkeleton />

  const room = rooms.find((r: Room) => r.id === id) ?? rooms[0]

  if (!room) return <div className="p-8 text-center">Chambre non trouvée.</div>

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl overflow-x-clip px-4 py-6 pb-44 sm:px-6 md:pb-10">
      <BackButton href="/chambres" className="mb-4" />
      {/* Fil d'ariane */}
      <nav className="text-sm text-gray-500 mb-4 flex min-w-0 flex-wrap items-center gap-1.5">
        <Link href="/" className="shrink-0 hover:text-secondary">Accueil</Link>
        <span aria-hidden="true">›</span>
        <Link href="/chambres" className="shrink-0 hover:text-secondary">Chambres & Suites</Link>
        <span aria-hidden="true">›</span>
        <span className="min-w-0 truncate font-medium text-ink">{room.name}</span>
      </nav>

      {/* Galerie de la chambre */}
      <div className="shadow-2xl rounded-3xl overflow-hidden ring-1 ring-gray-200 bg-white min-w-0">
        <RoomGallery room={room} />
      </div>

      <div className="mt-8 flex min-w-0 flex-col items-stretch justify-between gap-6 md:flex-row md:gap-8">
        {/* Détails Principaux */}
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-2xl sm:text-3xl font-extrabold text-gray-900 md:text-4xl">{room.name}</h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <Users className="size-4 shrink-0 text-primary" />
              {room.capacityAdults} Adultes, {room.capacityChildren} Enfant(s) max.
            </span>
            {room.size && (
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
                <LayoutTemplate className="size-4 shrink-0 text-primary" />
                {room.size} m²
              </span>
            )}
          </div>

          <section className="mt-8 min-w-0 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-secondary/20 inline-block">Description</h2>
            <p className="mt-3 leading-relaxed text-gray-600 text-base sm:text-lg break-words">
              {room.description}
            </p>
          </section>

          <RoomAmenities amenities={room.amenities} />
        </div>

        <BookingSidebar room={room} />
      </div>
    </div>
  )
}
