import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export default function Logo({ variant = 'light', size = 'md', href }: LogoProps) {
  // Tamaños de altura para el logo
  const heights = {
    sm: 24,
    md: 32,
    lg: 40,
  }

  // Logo blanco para fondos oscuros, logo normal para fondos claros
  const logoUrl =
    variant === 'light'
      ? 'https://www.omniwallet.net/assets/images/logo-white.svg'
      : 'https://www.omniwallet.net/assets/images/logo.svg'

  const content = (
    <div className="relative">
      <Image
        src={logoUrl}
        alt="Omniwallet"
        width={heights[size] * 4} // Aproximado para mantener aspect ratio
        height={heights[size]}
        className="object-contain"
        priority
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition inline-block">
        {content}
      </Link>
    )
  }

  return content
}
