import { Wallet } from 'lucide-react'
import Link from 'next/link'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export default function Logo({ variant = 'light', size = 'md', href }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const textColor = variant === 'light' ? 'text-white' : 'text-omniwallet-dark'
  const iconColor = variant === 'light' ? 'text-omniwallet-accent' : 'text-omniwallet-primary'

  const content = (
    <div className="flex items-center gap-2">
      <div className={`${iconColor} ${iconSizes[size]}`}>
        <Wallet className="w-full h-full" strokeWidth={2.5} />
      </div>
      <span className={`${textColor} ${sizeClasses[size]} font-bold tracking-tight`}>
        Omni<span className={iconColor}>wallet</span>
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition">
        {content}
      </Link>
    )
  }

  return content
}
