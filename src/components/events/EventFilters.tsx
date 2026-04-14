'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Category } from '@/generated/prisma/client'

const CATEGORIES: { value: Category | ''; label: string }[] = [
  { value: '', label: 'Alle' },
  { value: 'MUSIC', label: 'Musik' },
  { value: 'CULTURE', label: 'Kultur' },
  { value: 'PARTY', label: 'Party' },
  { value: 'FLEAMARKET', label: 'Flohmarkt' },
  { value: 'UNI', label: 'Uni' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'OTHER', label: 'Sonstiges' },
]

const DATE_FILTERS = [
  { value: '', label: 'Alle Termine' },
  { value: 'today', label: 'Heute' },
  { value: 'tomorrow', label: 'Morgen' },
  { value: 'week', label: 'Diese Woche' },
  { value: 'weekend', label: 'Wochenende' },
]

export default function EventFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? ''
  const activeDate = searchParams.get('date') ?? ''
  const search = searchParams.get('search') ?? ''

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
        <input
          type="search"
          placeholder="Events suchen..."
          defaultValue={search}
          onChange={(e) => updateParam('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {DATE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('date', value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeDate === value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('category', value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
