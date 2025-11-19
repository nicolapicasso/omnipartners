'use client'

import { useState, useEffect } from 'react'
import { toggleFavorite, trackContentView } from '../actions'
import { Star } from 'lucide-react'

export function FavoriteButton({
  contentId,
  initialIsFavorite,
}: {
  contentId: string
  initialIsFavorite: boolean
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleFavorite(contentId)
    if (result.success) {
      setIsFavorite(result.isFavorite!)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-3 rounded-lg font-semibold transition disabled:opacity-50 inline-flex items-center gap-2 ${
        isFavorite
          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Star className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
      {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
    </button>
  )
}

export function TrackViewButton({ contentId }: { contentId: string }) {
  useEffect(() => {
    // Track view on mount
    trackContentView(contentId, false)
  }, [contentId])

  return null
}
