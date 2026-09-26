import ChambresClient from './ChambresClient'
import type { Room } from '@/types/catalog'
import type { PlaceholderKind } from '@/components/Placeholder'

const VALID_PLACEHOLDER_KINDS: PlaceholderKind[] = [
  'beach', 'hotel', 'room', 'pool', 'car', 'monument', 'hut', 'map',
];

function toPlaceholderKind(kind: string): PlaceholderKind {
  return (VALID_PLACEHOLDER_KINDS as string[]).includes(kind) ? (kind as PlaceholderKind) : 'room';
}

function mapRoom(dto: Record<string, unknown>): Room {
  return {
    id: dto.id as string,
    name: dto.name as string,
    description: (dto.description as string) ?? '',
    price: Number(dto.basePrice),
    capacityAdults: dto.capacityAdults as number,
    capacityChildren: dto.capacityChildren as number,
    size: (dto.sizeSqm as number) ?? undefined,
    kind: toPlaceholderKind(dto.kind as string),
    amenities: dto.amenities as string[],
    images: dto.images as string[],
  };
}

import { rooms as mockRooms } from '@/data/mock';

async function fetchRoomsSSR(): Promise<Room[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    // fetch hotels
    const hotelsRes = await fetch(`${apiUrl}/hotels`, { next: { revalidate: 60 } });
    if (!hotelsRes.ok) return mockRooms;
    
    const hotelsPage = await hotelsRes.json();
    const firstHotel = hotelsPage.data?.[0];
    if (!firstHotel) return mockRooms;

    // fetch hotel details
    const hotelRes = await fetch(`${apiUrl}/hotels/${firstHotel.id}`, { next: { revalidate: 60 } });
    if (!hotelRes.ok) return mockRooms;
    
    const hotel = await hotelRes.json();
    const rooms = ((hotel.rooms ?? []) as Record<string, unknown>[]).map(mapRoom);
    return rooms.length > 0 ? rooms : mockRooms;
  } catch (error) {
    console.error("Failed to fetch rooms for SSR", error);
    return mockRooms;
  }
}

export default async function RoomsCatalogPage() {
  const rooms = await fetchRoomsSSR();
  return <ChambresClient initialRooms={rooms} />;
}
