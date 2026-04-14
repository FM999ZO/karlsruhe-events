import { prisma } from '@/lib/db'
import { Category, Status, type Event } from '@/generated/prisma/client'
import EventCard from './EventCard'

type Filters = {
  category?: string
  date?: string
  search?: string
  page?: number
}

async function getEvents(filters: Filters) {
  const now = new Date()
  const page = filters.page ?? 1
  const limit = 20

  let dateFilter: { gte?: Date; lte?: Date } | undefined
  if (filters.date === 'today') {
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    dateFilter = { gte: now, lte: end }
  } else if (filters.date === 'tomorrow') {
    const start = new Date(now)
    start.setDate(start.getDate() + 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    dateFilter = { gte: start, lte: end }
  } else if (filters.date === 'week') {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    dateFilter = { gte: now, lte: end }
  } else if (filters.date === 'weekend') {
    const dayOfWeek = now.getDay()
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
    const start = new Date(now)
    start.setDate(start.getDate() + daysUntilSaturday)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    end.setHours(23, 59, 59, 999)
    dateFilter = { gte: start, lte: end }
  } else {
    dateFilter = { gte: now }
  }

  const category = filters.category as Category | undefined

  const where = {
    status: Status.PUBLISHED,
    ...(category && { category }),
    dateStart: dateFilter,
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { dateStart: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return { events, total, page, limit }
}

export default async function EventList({ filters }: { filters: Filters }) {
  const { events, total } = await getEvents(filters)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <span className="text-5xl mb-4">📭</span>
        <p className="text-lg font-medium">Keine Events gefunden</p>
        <p className="text-sm mt-1">Versuch andere Filter oder schau später nochmal.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        {total} {total === 1 ? 'Event' : 'Events'} gefunden
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event: Event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </div>
  )
}
