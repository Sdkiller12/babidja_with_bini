import { Metadata } from 'next';
import RestaurantsClient from './RestaurantsClient';

export const metadata: Metadata = {
  title: 'Restaurants & Gastronomie | Babidja',
  description: 'Découvrez les meilleures tables et réservez votre restaurant en quelques clics sur Babidja.',
  openGraph: {
    title: 'Restaurants & Gastronomie | Babidja',
    description: 'Découvrez les meilleures tables et réservez votre restaurant en quelques clics.',
    type: 'website',
  },
};

export default function RestaurantsPage() {
  return <RestaurantsClient />;
}
