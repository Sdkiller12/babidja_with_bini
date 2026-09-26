import { Home, Search } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable — Babydja',
};

/**
 * UX-03 : Page 404 Next.js App Router.
 * Affichée quand aucune route ne correspond à l'URL demandée.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] w-full min-w-0 flex-col items-center justify-center overflow-x-clip px-4 sm:px-6 py-10 text-center">
      <div className="mb-4 font-extrabold text-6xl sm:text-[96px] leading-none text-gray-100 select-none">
        404
      </div>
      <h1 className="text-balance text-xl sm:text-2xl font-extrabold text-gray-900">Page introuvable</h1>
      <p className="mt-3 max-w-md text-sm sm:text-base text-gray-500">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:w-auto">
        <Link
          href="/"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-dark"
          aria-label="Retour à l'accueil"
        >
          <Home className="size-4 shrink-0" aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/chambres"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          aria-label="Voir nos chambres"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          Voir nos chambres
        </Link>
      </div>
    </div>
  );
}
