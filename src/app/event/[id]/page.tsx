import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Status, Category } from '@/generated/prisma/client'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

const CATEGORY_LABELS: Record<Category, string> = {
  MUSIC: 'Musik',
  CULTURE: 'Kultur',
  PARTY: 'Party',
  FLEAMARKET: 'Flohmarkt',
  UNI: 'Uni',
  SPORT: 'Sport',
  OTHER: 'Sonstiges',
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id, status: Status.PUBLISHED },
    select: { title: true, description: true },
  })
  if (!event) return {}
  return {
    title: `${event.title} – Karlsruhe Events`,
    description: event.description.slice(0, 160),
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id, status: Status.PUBLISHED },
  })

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            ← Zurück zu allen Events
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {event.imageUrl && (
            <div className="h-64 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">
                {CATEGORY_LABELS[event.category]}
              </span>
              {event.isFeatured && (
                <span className="text-sm font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-zinc-900">{event.title}</h1>

            <div className="flex flex-col gap-2 text-sm text-zinc-600">
              <div className="flex items-start gap-2">
                <span className="mt-0.5">🗓</span>
                <div>
                  <p>{formatDateTime(event.dateStart)}</p>
                  {event.dateEnd && (
                    <p className="text-zinc-400">bis {formatDateTime(event.dateEnd)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <div>
                  <p className="font-medium text-zinc-900">{event.locationName}</p>
                  {event.locationAddress && (
                    <p className="text-zinc-500">{event.locationAddress}</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-zinc-100" />

            <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </div>

            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mehr Infos →
              </a>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
