'use client';
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Home, SearchX } from 'lucide-react'
import BookingWidget from '@/components/BookingWidget'
import CarCard from '@/components/CarCard'
import type { Vehicle } from '@/types/catalog'

const CATEGORY_OPTIONS = ['Toutes', 'SUV', 'Berline', 'Citadine', '4x4']
const TRANSMISSION_OPTIONS = ['Toutes', 'Automatique', 'Manuelle']
const PRICE_OPTIONS = ['Tous les prix', 'Moins de 30 000', '30 000 – 60 000', 'Plus de 60 000']

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-gray-200 bg-white px-5 py-2.5 pr-10 text-sm font-semibold text-gray-700 shadow-sm transition-all focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 cursor-pointer hover:border-secondary hover:text-secondary"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o === options[0] ? `${label}` : o}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-secondary">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  )
}

function matchesCategory(car: Vehicle, filter: string) {
  if (filter === 'Toutes') return true
  const name = car.name.toLowerCase()
  if (filter === 'SUV') return name.includes('suv') || name.includes('3008')
  if (filter === 'Berline') return name.includes('berline') || name.includes('corolla')
  if (filter === 'Citadine') return name.includes('clio') || name.includes('citadine')
  if (filter === '4x4') return name.includes('prado') || name.includes('4x4') || name.includes('land')
  return true
}

function matchesTransmission(car: Vehicle, filter: string) {
  if (filter === 'Toutes') return true
  return car.transmission?.toLowerCase() === filter.toLowerCase()
}

function matchesPrice(price: number, filter: string) {
  if (filter === 'Moins de 30 000') return price < 30000
  if (filter === '30 000 – 60 000') return price >= 30000 && price <= 60000
  if (filter === 'Plus de 60 000') return price > 60000
  return true
}

export default function VoituresClient({ initialCars }: { initialCars: Vehicle[] }) {
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [transmission, setTransmission] = useState(TRANSMISSION_OPTIONS[0])
  const [price, setPrice] = useState(PRICE_OPTIONS[0])

  const filtered = initialCars.filter(
    (c) => matchesCategory(c, category) && matchesTransmission(c, transmission) && matchesPrice(c.price, price)
  )

  return (
    <div className="bg-gray-50/50 min-h-dvh w-full min-w-0 overflow-x-clip pb-16">
      {/* Hero Header */}
      <div className="relative bg-linear-to-r from-gray-900 to-gray-800 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/image_banniere_de_recherche.png')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto min-w-0">
          {/* Fil d'ariane */}
          <nav className="flex min-w-0 flex-wrap items-center text-sm font-medium text-gray-300 mb-6 sm:mb-8">
            <Link href="/" className="hover:text-white flex shrink-0 items-center gap-1">
              <Home className="size-4" /> Accueil
            </Link>
            <ChevronRight className="size-4 mx-2 shrink-0" />
            <span className="truncate text-white">Location Auto</span>
          </nav>
          
          <h1 className="text-balance text-[clamp(1.875rem,6vw,3rem)] font-extrabold tracking-tight mb-4">
            Prenez la route en toute <span className="text-[#e97c2a]">sérénité</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl">
            De la citadine économique au 4x4 robuste, trouvez le véhicule idéal pour explorer la Côte d&apos;Ivoire.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Widget de Recherche Flottant */}
        <div className="relative -mt-10 mb-8 sm:mb-12 z-20 w-full min-w-0 max-w-4xl rounded-2xl bg-white p-3 sm:p-5 shadow-xl ring-1 ring-gray-900/5">
          <BookingWidget className="border-none shadow-none" />
        </div>

        {/* Filtres */}
        <div className="mb-8 sm:mb-10 flex min-w-0 flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Filtrer par :</span>
            <FilterSelect label="Catégorie" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
            <FilterSelect label="Transmission" options={TRANSMISSION_OPTIONS} value={transmission} onChange={setTransmission} />
            <FilterSelect label="Prix max" options={PRICE_OPTIONS} value={price} onChange={setPrice} />
          </div>
          <div className="self-start sm:self-auto text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full whitespace-nowrap">
            {filtered.length} véhicule{filtered.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille de résultats */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 px-4 text-center shadow-sm border border-gray-100">
            <div className="grid size-24 place-items-center rounded-full bg-orange-50 text-primary mb-6">
               <SearchX className="size-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Nous n&apos;avons pas trouvé de véhicules correspondant à vos critères actuels. Essayez de modifier vos filtres.</p>
            <button
              onClick={() => { setCategory(CATEGORY_OPTIONS[0]); setTransmission(TRANSMISSION_OPTIONS[0]); setPrice(PRICE_OPTIONS[0]); }}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c: Vehicle) => (
              <CarCard key={c.id} car={c} variant="catalog" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
