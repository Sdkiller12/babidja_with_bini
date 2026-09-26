'use client';
import Link from 'next/link'
import { BedDouble, Car, ChevronRight, Star, MessageCircle, Utensils, Search, CheckCircle2, HeartHandshake, Building2, ShieldCheck, Smartphone, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import RoomCard from '@/components/RoomCard'
import CarCard from '@/components/CarCard'
import RestaurantCard from '@/components/RestaurantCard'
import { fetchRooms, fetchCars, fetchRestaurants } from '@/lib/api/catalog'
import BookingWidget from '@/components/BookingWidget'
import CardSkeleton from '@/components/ui/CardSkeleton'
import type { Room, Vehicle } from '@/types/catalog'
import http from '@/lib/http'
import Button from '@/components/ui/Button'
import { useState } from 'react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user?: { firstName: string; lastName: string }
}

async function fetchReviews(): Promise<Review[]> {
  try {
    const { data: hotelsPage } = await http.get('/hotels')
    const firstHotel = hotelsPage.data?.[0]
    if (!firstHotel) return []
    const { data } = await http.get(`/hotels/${firstHotel.id}/reviews`)
    return Array.isArray(data) ? data : data.data ?? []
  } catch {
    return []
  }
}

function SectionHeader({ title, to, subtitle }: { title: string, to?: string, subtitle?: string }) {
  return (
    <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
      </div>
      {to && (
        <Link href={to} className="group inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-700 transition-colors">
          Voir tout 
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'cars' | 'restaurants'>('rooms')

  const { data: rooms = [], isLoading: roomsLoading, isError: roomsError } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 5 * 60 * 1000,
  })

  const { data: cars = [], isLoading: carsLoading, isError: carsError } = useQuery<Vehicle[]>({
    queryKey: ['cars'],
    queryFn: fetchCars,
    staleTime: 5 * 60 * 1000,
  })

  const { data: restaurants = [], isLoading: restaurantsLoading, isError: restaurantsError } = useQuery<Record<string, unknown>[]>({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    staleTime: 5 * 60 * 1000,
  })

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews-home'],
    queryFn: fetchReviews,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div className="pb-16 bg-gray-50/50">
      {/* Bannière hero immersive (Premium) */}
      <section className="relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden">
        {/* Background avec l'image locale pour un look riche */}
        <div className="absolute inset-0 z-0">
           <img 
              src="/image_banniere_de_recherche.png" 
              alt="Hero Background" 
              className="w-full h-full object-cover"
           />
           {/* Gradient sophistiqué */}
           <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/50 to-transparent"></div>
           <div className="absolute inset-0 bg-linear-to-r from-gray-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full min-w-0 max-w-7xl px-4 sm:px-6 pt-16 sm:pt-20">
          <div className="max-w-3xl min-w-0">
            <span className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] sm:px-4 sm:text-sm font-semibold tracking-wide text-white backdrop-blur-md border border-white/20 shadow-lg">
              <span className="relative flex size-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2.5 bg-primary"></span>
              </span>
              <span className="truncate">L&apos;excellence Ivoirienne à portée de clic</span>
            </span>
            <h1 className="mb-6 max-w-full text-balance break-words text-[clamp(2rem,5vw+1rem,3.75rem)] font-extrabold leading-[1.05] text-white">
              Vivez l'exceptionnel <br className="hidden sm:block" /> en <span className="text-primary bg-clip-text">Côte d&apos;Ivoire.</span>
            </h1>
            <p className="mb-10 max-w-2xl text-base sm:text-xl font-medium text-gray-200 leading-relaxed">
              Votre plateforme premium pour dénicher des séjours exclusifs, des véhicules fiables et des tables mémorables. Réservez en toute sérénité.
            </p>
          </div>
          
          <div className="mt-8 min-w-0 rounded-3xl sm:rounded-4xl bg-white/10 p-2 sm:p-4 backdrop-blur-xl border border-white/20 shadow-2xl">
            <BookingWidget />
          </div>

          <div className="mt-8 sm:mt-12 flex flex-wrap gap-3 sm:gap-8 text-white/80 text-[13px] sm:text-sm font-medium">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Plus de 500 partenaires vérifiés</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Paiement 100% sécurisé (Mobile Money & CB)</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <span>Service client local 24/7</span>
             </div>
          </div>
        </div>
      </section>

      {/* Raccourcis services (Cartes premium avec background images) */}
      <section className="relative -mt-10 z-20 mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 mb-16 sm:mb-24">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
          <Link href="/chambres" className="group relative h-56 sm:h-64 overflow-hidden rounded-3xl shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hébergements" loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10"></div>
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end min-w-0">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30">
                <BedDouble className="size-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Hébergements</h3>
              <p className="text-sm text-gray-200 line-clamp-2">Trouvez la chambre, la suite ou la résidence parfaite pour votre séjour.</p>
            </div>
          </Link>
          
          <Link href="/voitures" className="group relative h-56 sm:h-64 overflow-hidden rounded-3xl shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl">
            <img src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1472&auto=format&fit=crop" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Location Auto" loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10"></div>
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end min-w-0">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30">
                <Car className="size-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Location Auto</h3>
              <p className="text-sm text-gray-200 line-clamp-2">Louez des véhicules fiables avec ou sans chauffeur, pour tous vos déplacements.</p>
            </div>
          </Link>

          <Link href="/restaurants" className="group relative h-56 sm:h-64 overflow-hidden rounded-3xl shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gastronomie" loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10"></div>
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end min-w-0">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30">
                <Utensils className="size-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Gastronomie</h3>
              <p className="text-sm text-gray-200 line-clamp-2">Découvrez les meilleures tables de Babi et réservez votre menu à l'avance.</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6">

        {/* Comment ça marche ? (Design Vertical / Minimaliste) */}
        <section className="mb-16 sm:mb-24 lg:mb-32">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">Le Parcours Babydja. <br /><span className="text-gray-400">Simple et Rapide.</span></h2>
                 <p className="text-gray-600 text-lg mb-10 leading-relaxed">En seulement 3 étapes, planifiez votre prochaine escapade ou votre dîner d'affaires en toute sérénité. Nous avons pensé à tout pour vous faire gagner du temps.</p>
                 
                 <div className="space-y-8">
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary font-bold shadow-sm">1</div>
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                       </div>
                       <div className="pb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Explorez et Comparez</h3>
                          <p className="text-gray-600">Parcourez nos offres de haute qualité. Chaque établissement et véhicule est rigoureusement vérifié par nos équipes.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold shadow-sm">2</div>
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                       </div>
                       <div className="pb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Réservez en Sécurité</h3>
                          <p className="text-gray-600">Sélectionnez vos dates et payez un petit acompte via Mobile Money ou Carte Bancaire pour garantir votre réservation.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600 font-bold shadow-sm">3</div>
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Profitez sur place</h3>
                          <p className="text-gray-600">Présentez-vous à l'établissement, payez le solde restant et savourez l'expérience sans stress.</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="relative min-h-[20rem] rounded-3xl overflow-hidden shadow-2xl h-auto sm:h-[clamp(22rem,60vw,37.5rem)] lg:h-150">
                 <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1374&auto=format&fit=crop" alt="Experience Babydja" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                 <div className="absolute inset-0 bg-linear-to-tr from-primary/40 to-transparent mix-blend-overlay"></div>
                 
                 {/* Floating badge */}
                 <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-8 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="grid size-12 shrink-0 place-items-center rounded-full bg-green-100 text-green-600">
                       <ShieldCheck className="size-6" />
                    </div>
                    <div className="min-w-0">
                       <h4 className="font-bold text-gray-900">Qualité Garantie</h4>
                       <p className="text-sm text-gray-600">100% de nos partenaires sont évalués.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Tabbed Showcase */}
        <section className="mb-16 sm:mb-24 lg:mb-32">
           <div className="text-center mb-8 sm:mb-12 px-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 text-balance">Nos Incontournables</h2>
              <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">Laissez-vous tenter par notre sélection des meilleures offres du moment.</p>
           </div>
           
           <div className="flex justify-start sm:justify-center mb-8 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
              <div className="inline-flex shrink-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 max-w-full">
                 <button 
                    onClick={() => setActiveTab('rooms')} 
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${activeTab === 'rooms' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                    <BedDouble className="size-4 shrink-0" /> Séjours
                 </button>
                 <button 
                    onClick={() => setActiveTab('cars')} 
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${activeTab === 'cars' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                    <Car className="size-4 shrink-0" /> Mobilité
                 </button>
                 <button 
                    onClick={() => setActiveTab('restaurants')} 
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${activeTab === 'restaurants' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                    <Utensils className="size-4 shrink-0" /> Gastronomie
                 </button>
              </div>
           </div>

           <div className="min-h-100 min-w-0">
              {activeTab === 'rooms' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end mb-6">
                       <h3 className="text-2xl font-bold text-gray-900">Résidences & Hôtels d'exception</h3>
                       <Link href="/chambres" className="text-sm font-bold text-primary hover:underline">Voir tout</Link>
                    </div>
                    {roomsError ? (
                       <p className="text-sm text-red-500 py-4">Impossible de charger les chambres.</p>
                    ) : (
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                       {roomsLoading
                          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                          : rooms.slice(0, 4).map((r: Room) => <RoomCard key={r.id} room={r} />)
                       }
                       </div>
                    )}
                 </div>
              )}

              {activeTab === 'cars' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end mb-6">
                       <h3 className="text-2xl font-bold text-gray-900">Véhicules Premium</h3>
                       <Link href="/voitures" className="text-sm font-bold text-primary hover:underline">Voir tout</Link>
                    </div>
                    {carsError ? (
                       <p className="text-sm text-red-500 py-4">Impossible de charger les voitures.</p>
                    ) : (
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                       {carsLoading
                          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                          : cars.slice(0, 4).map((c: Vehicle) => <CarCard key={c.id} car={c} />)
                       }
                       </div>
                    )}
                 </div>
              )}

              {activeTab === 'restaurants' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end mb-6">
                       <h3 className="text-2xl font-bold text-gray-900">Les Meilleures Tables</h3>
                       <Link href="/restaurants" className="text-sm font-bold text-primary hover:underline">Voir tout</Link>
                    </div>
                    {restaurantsError ? (
                       <p className="text-sm text-red-500 py-4">Impossible de charger les restaurants.</p>
                    ) : (
                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                       {restaurantsLoading
                          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                          : restaurants.slice(0, 4).map((r: Record<string, unknown>) => <RestaurantCard key={r.id as string} restaurant={r} />)
                       }
                       </div>
                    )}
                 </div>
              )}
           </div>
        </section>

        {/* B2B / Devenir Partenaire Banner (Premium Split) */}
        <section className="mb-16 sm:mb-24 lg:mb-32 min-w-0">
           <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gray-900 text-white shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                 <div className="p-6 sm:p-10 lg:p-20 flex flex-col justify-center relative z-10 min-w-0">
                    <div className="absolute inset-0 bg-linear-to-r from-gray-900 via-gray-900 to-transparent z-0 hidden lg:block"></div>
                    <div className="relative z-10 min-w-0">
                       <span className="inline-block px-4 py-1.5 bg-white/10 text-white font-bold rounded-full text-[11px] sm:text-xs uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-md">Gérants & Propriétaires</span>
                       <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-balance">Booster votre activité avec <span className="text-primary">Babydja</span>.</h2>
                       <p className="text-gray-300 text-base sm:text-xl mb-8 sm:mb-10 leading-relaxed max-w-lg">
                         Rejoignez notre réseau de partenaires d&apos;excellence. Digitalisez vos réservations, augmentez votre visibilité et simplifiez votre gestion au quotidien.
                       </p>
                       <Link href="/devenir-partenaire" className="w-fit max-w-full">
                          <Button size="lg" className="h-12 sm:h-14 min-h-[44px] w-full sm:w-fit rounded-full shadow-lg hover:shadow-primary/50 text-white font-bold text-sm sm:text-base px-6 sm:px-8 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1">
                            <Building2 className="size-5 shrink-0" />
                            Devenir Partenaire Officiel
                          </Button>
                       </Link>
                    </div>
                 </div>
                 <div className="relative min-h-[12rem] h-64 sm:h-80 lg:h-auto">
                    <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1470&auto=format&fit=crop" alt="Devenir Partenaire" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent lg:hidden"></div>
                 </div>
              </div>
           </div>
        </section>

        {/* Pourquoi Babydja ? (Avantages ivoiriens) */}
        <section className="mb-16 sm:mb-24 lg:mb-32">
          <div className="text-center mb-10 sm:mb-16 px-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 text-balance">L'Engagement Babydja</h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">Conçu sur-mesure pour répondre aux exigences locales et internationales.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
             <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center flex flex-col items-center">
                <div className="grid size-16 place-items-center rounded-full bg-secondary/10 text-secondary mb-6">
                   <ShieldCheck className="size-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Qualité Vérifiée</h4>
                <p className="text-gray-600 text-sm">Chaque établissement est visité et audité pour garantir des standards élevés.</p>
             </div>
             <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center flex flex-col items-center">
                <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary mb-6">
                   <Smartphone className="size-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Paiement Flexible</h4>
                <p className="text-gray-600 text-sm">Réglez facilement via Mobile Money ou Carte Bancaire sécurisée.</p>
             </div>
             <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center flex flex-col items-center">
                <div className="grid size-16 place-items-center rounded-full bg-indigo-100 text-indigo-600 mb-6">
                   <MessageCircle className="size-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Support 24/7</h4>
                <p className="text-gray-600 text-sm">Une équipe locale basée à Abidjan pour vous assister à tout moment.</p>
             </div>
             <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center flex flex-col items-center">
                <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                   <Users className="size-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Communauté</h4>
                <p className="text-gray-600 text-sm">Des milliers d'utilisateurs satisfaits partagent leurs avis vérifiés.</p>
             </div>
          </div>
        </section>

        {/* Section Avis Clients */}
        <section className="mb-24">
          <SectionHeader title="La parole est à vous" subtitle="Ce que nos utilisateurs pensent de leur expérience Babydja." />
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
              <MessageCircle className="size-16 text-gray-300" />
              <p className="text-xl font-medium text-gray-900">Aucun avis pour le moment.</p>
              <p className="text-gray-500">Soyez le premier à partager votre expérience après votre séjour !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((review: Review) => {
                const name = review.user
                  ? [review.user.firstName, review.user.lastName].filter(Boolean).join(' ') || 'Client'
                  : 'Client vérifié'
                const date = new Date(review.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
                return (
                  <div key={review.id} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                       <MessageCircle className="size-24" />
                    </div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="grid size-14 place-items-center rounded-full bg-gray-900 text-white font-bold text-xl shadow-md">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{name}</p>
                        <p className="text-sm text-gray-500">{date}</p>
                      </div>
                    </div>
                    <div className="mb-4 flex gap-1 relative z-10">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed italic relative z-10 text-lg">"{review.comment}"</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
