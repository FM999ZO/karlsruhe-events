import Link from 'next/link'
import { Category } from '@/generated/prisma/client'

const CATEGORY_LABELS: Record<Category, string> = {
  MUSIC: 'Musik',
  CULTURE: 'Kultur',
  PARTY: 'Party',
  FLEAMARKET: 'Flohmarkt',
  UNI: 'Uni',
  SPORT: 'Sport',
  OTHER: 'Sonstiges',
}

const CATEGORY_COLORS: Record<Category, string> = {
  MUSIC: 'bg-purple-100 text-purple-700',
  CULTURE: 'bg-blue-100 text-blue-700',
  PARTY: 'bg-pink-100 text-pink-700',
  FLEAMARKET: 'bg-yellow-100 text-yellow-700',
  UNI: 'bg-green-100 text-green-700',
  SPORT: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-zinc-100 text-zinc-600',
}

type EventCardProps = {
  id: string
  title: string
  description: string
  dateStart: Date
  dateEnd: Date | null
  locationName: string
  locationAddress: string | null
  category: Category
  imageUrl: string | null
  isFeatured: boolean
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default function EventCard({
  id,
  title,
  description,
  dateStart,
  dateEnd,
  locationName,
  category,
  imageUrl,
  isFeatured,
}: EventCardProps) {
  return (
    <Link
      href={`/event/${id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative h-40 bg-zinc-100 shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-4xl">
            {category === 'MUSIC' ? '🎵' :
             category === 'CULTURE' ? '🎭' :
             category === 'PARTY' ? '🎉' :
             category === 'FLEAMARKET' ? '🛒' :
             category === 'UNI' ? '🎓' :
             category === 'SPORT' ? '⚽' : '📅'}
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category]}`}>
            {CATEGORY_LABELS[category]}
          </span>
        </div>

        <h3 className="font-semibold text-zinc-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-zinc-500 line-clamp-2 flex-1">
          {description}
        </p>

        <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
            <span>🗓</span>
            <span>{formatDate(dateStart)}</span>
            {dateEnd && (
              <span className="text-zinc-400">– {formatDate(dateEnd)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
            <span>📍</span>
            <span className="truncate">{locationName}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
