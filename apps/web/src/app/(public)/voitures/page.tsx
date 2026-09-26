import VoituresClient from './VoituresClient'
import type { Vehicle } from '@/types/catalog'

function mapVehicle(dto: Record<string, unknown>): Vehicle {
  return {
    id: dto.id as string,
    name: `${dto.brand} ${dto.model}`,
    description: (dto.description as string) ?? '',
    price: Number(dto.pricePerDay),
    transmission: dto.transmission as string,
    kind: 'car',
    images: dto.images as string[],
  };
}

import { cars as mockCars } from '@/data/mock';

async function fetchCarsSSR(): Promise<Vehicle[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    // fetch vehicles
    const vehiclesRes = await fetch(`${apiUrl}/vehicles`, { next: { revalidate: 60 } });
    if (!vehiclesRes.ok) return mockCars;
    
    const vehiclesPage = await vehiclesRes.json();
    const cars = ((vehiclesPage.data ?? []) as Record<string, unknown>[]).map(mapVehicle);
    return cars.length > 0 ? cars : mockCars;
  } catch (error) {
    console.error("Failed to fetch cars for SSR", error);
    return mockCars;
  }
}

export default async function CarsCatalogPage() {
  const cars = await fetchCarsSSR();
  return <VoituresClient initialCars={cars} />;
}
