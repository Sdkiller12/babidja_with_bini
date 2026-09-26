import Link from 'next/link'
import { MapPin } from 'lucide-react'
import Placeholder from './Placeholder'

export default function RestaurantCard({ restaurant }: { restaurant: Record<string, unknown> }) {
  const minTablePrice = Array.isArray(restaurant.tables) && restaurant.tables.length > 0 
    ? Math.min(...restaurant.tables.map((t: Record<string, unknown>) => parseFloat(t.basePrice as string))) 
    : 0;

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-primary/20">
      <Link href={`/restaurants/${restaurant.id as string}`} className="block aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Placeholder kind="monument" />
      </Link>
      
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <h3 className="min-w-0 text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/restaurants/${restaurant.id as string}`}>
            {restaurant.name as string}
          </Link>
        </h3>
        
        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{restaurant.city as string} - {restaurant.address as string}</span>
        </div>

        <div className="mt-4 flex min-w-0 flex-1 flex-wrap items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">À partir de</span>
            <span className="text-base sm:text-lg font-extrabold text-[#e97c2a]">
              {minTablePrice} FCFA
            </span>
          </div>
          
          <Link 
            href={`/restaurants/${restaurant.id as string}`}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Réserver
          </Link>
        </div>
      </div>
    </div>
  )
}
