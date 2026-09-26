import Link from 'next/link'
import Image from 'next/image'

/**
 * Logo Babydja utilisant l'image.
 */
export default function Logo({ variant = 'public', to = '/', className = '' }) {
  return (
    <Link href={to} className={`inline-flex flex-col items-start ${className}`}>
      <Image
        src="/logo.jpeg"
        alt="Logo Babydja"
        width={256}
        height={256}
        className={variant === 'pro' ? 'h-8 w-auto max-w-full object-contain sm:h-10' : 'h-10 w-auto max-w-full object-contain sm:h-12 lg:h-14'}
      />
    </Link>
  )
}
