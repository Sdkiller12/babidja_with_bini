import { useRouter, usePathname } from 'next/navigation'
import { CalendarDays, Users, ArrowRight, BedDouble, CarFront, Utensils } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBookingStore } from '../store/useBookingStore'

const bookingSchema = z.object({
  arrival: z.string().min(1, "Requis"),
  departure: z.string().min(1, "Requis"),
  guests: z.string().min(1, "Requis"),
}).refine((data) => {
  return new Date(data.arrival) < new Date(data.departure)
}, {
  message: "Date invalide",
  path: ["departure"],
})

export default function BookingWidget({ className = '' }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const { arrival, departure, guests, setSearchCriteria } = useBookingStore()
  
  // Si on est sur /voitures, on force l'onglet voiture, sinon hôtel par défaut.
  const isCarPage = pathname.includes('/voitures')
  const isRestaurantPage = pathname.includes('/restaurants')
  const defaultTab = isRestaurantPage ? 'restaurant' : isCarPage ? 'car' : 'room'
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      arrival,
      departure,
      guests,
    }
  })

  // Empêche la sélection de dates passées / d'un départ avant l'arrivée
  const today = new Date().toISOString().split('T')[0]
  // eslint-disable-next-line react-hooks/incompatible-library
  const arrivalValue = watch('arrival')

  const onSubmit = (data: z.infer<typeof bookingSchema>) => {
    setSearchCriteria(data.arrival, data.departure, data.guests, defaultTab === 'restaurant' ? undefined : defaultTab)
    if (defaultTab === 'car') {
      router.push('/voitures')
    } else if (defaultTab === 'restaurant') {
      router.push('/restaurants')
    } else {
      router.push('/chambres')
    }
  }

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      {/* Tabs */}
      <div className="flex max-w-full gap-1 self-start overflow-x-auto rounded-full bg-gray-100 p-1 sm:ml-0 ml-2">
        <button
          type="button"
          onClick={() => router.push('/chambres')}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[13px] sm:text-sm font-bold transition-colors ${
            defaultTab === 'room' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BedDouble className="size-4 shrink-0" /> Hébergements
        </button>
        <button
          type="button"
          onClick={() => router.push('/voitures')}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[13px] sm:text-sm font-bold transition-colors ${
            defaultTab === 'car' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CarFront className="size-4 shrink-0" /> Voitures
        </button>
        <button
          type="button"
          onClick={() => router.push('/restaurants')}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[13px] sm:text-sm font-bold transition-colors ${
            defaultTab === 'restaurant' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Utensils className="size-4 shrink-0" /> Gastronomie
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-w-0 flex-col sm:flex-row sm:items-center items-stretch gap-2 rounded-3xl sm:rounded-full bg-white p-2 shadow-xl relative"
      >
        <div className="flex min-w-0 w-full flex-1 items-center gap-3 px-4 py-2 sm:py-0">
        <CalendarDays className="size-5 shrink-0 text-primary" />
        <div className="flex min-w-0 flex-col flex-1 relative pb-0">
          <label htmlFor="arrival-date" className="text-xs font-bold uppercase text-gray-500">Arrivée</label>
          <input
            id="arrival-date"
            type="date"
            min={today}
            className="w-full min-w-0 bg-transparent text-sm font-medium outline-none"
            {...register('arrival')}
          />
          {errors.arrival && <span className="mt-1 text-xs text-red-500 font-medium sm:absolute sm:-bottom-5 sm:left-0 sm:mt-0 sm:text-[10px] sm:whitespace-nowrap">{errors.arrival.message as string}</span>}
        </div>
      </div>
      
      <div className="hidden h-8 w-px shrink-0 bg-gray-200 sm:block"></div>
      
      <div className="flex min-w-0 w-full flex-1 items-center gap-3 border-t border-gray-100 px-4 py-3 sm:border-0 sm:py-0">
        <CalendarDays className="size-5 shrink-0 text-primary" />
        <div className="flex min-w-0 flex-col flex-1 relative pb-0">
          <label htmlFor="departure-date" className="text-xs font-bold uppercase text-gray-500">Départ</label>
          <input
            id="departure-date"
            type="date"
            min={arrivalValue || today}
            className="w-full min-w-0 bg-transparent text-sm font-medium outline-none"
            {...register('departure')}
          />
          {errors.departure && <span className="mt-1 text-xs text-red-500 font-medium sm:absolute sm:-bottom-5 sm:left-0 sm:mt-0 sm:text-[10px] sm:whitespace-nowrap">{errors.departure.message as string}</span>}
        </div>
      </div>

      {defaultTab === 'room' && (
        <>
          <div className="hidden h-8 w-px shrink-0 bg-gray-200 sm:block"></div>
          
          <div className="flex min-w-0 w-full flex-1 items-center gap-3 border-t border-gray-100 px-4 py-3 sm:border-0 sm:py-0">
            <Users className="size-5 shrink-0 text-primary" />
            <div className="flex min-w-0 flex-col flex-1 relative pb-0">
              <label htmlFor="guests-select" className="text-xs font-bold uppercase text-gray-500">Voyageurs</label>
              <select id="guests-select" className="w-full min-w-0 bg-transparent text-sm font-medium outline-none" {...register('guests')}>
                <option value="1 Adulte">1 Adulte</option>
                <option value="2 Adultes">2 Adultes</option>
                <option value="2 Adultes, 1 Enfant">2 Adultes, 1 Enfant</option>
                <option value="2 Adultes, 2 Enfants">2 Adultes, 2 Enfants</option>
              </select>
              {errors.guests && <span className="mt-1 text-xs text-red-500 font-medium sm:absolute sm:-bottom-5 sm:left-0 sm:mt-0 sm:text-[10px] sm:whitespace-nowrap">{errors.guests.message as string}</span>}
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        className="group mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-bold text-white transition-all hover:bg-secondary-dark active:scale-95 sm:mt-0 sm:w-auto sm:shrink-0"
      >
        Rechercher <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </button>
      </form>
    </div>
  )
}
