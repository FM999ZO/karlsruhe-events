import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { Category, Status } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const category = searchParams.get('category') as Category | null
  const date = searchParams.get('date')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const now = new Date()

  let dateFilter: { gte?: Date; lte?: Date } | undefined
  if (date === 'today') {
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    dateFilter = { gte: now, lte: end }
  } else if (date === 'tomorrow') {
    const start = new Date(now)
    start.setDate(start.getDate() + 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    dateFilter = { gte: start, lte: end }
  } else if (date === 'week') {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    dateFilter = { gte: now, lte: end }
  } else if (date === 'weekend') {
    const dayOfWeek = now.getDay()
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
    const start = new Date(now)
    start.setDate(start.getDate() + daysUntilSaturday)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    end.setHours(23, 59, 59, 999)
    dateFilter = { gte: start, lte: end }
  }

  const where = {
    status: Status.PUBLISHED,
    ...(category && { category }),
    ...(dateFilter && { dateStart: dateFilter }),
    ...(featured === 'true' && { isFeatured: true }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { dateStart: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        dateStart: true,
        dateEnd: true,
        locationName: true,
        locationAddress: true,
        category: true,
        imageUrl: true,
        isFeatured: true,
      },
    }),
    prisma.event.count({ where }),
  ])

  return Response.json({
    data: events,
    meta: {
      total,
      page,
      limit,
      hasMore: page * limit < total,
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description,
      dateStart: new Date(body.dateStart),
      dateEnd: body.dateEnd ? new Date(body.dateEnd) : null,
      locationName: body.locationName,
      locationAddress: body.locationAddress ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      category: body.category,
      imageUrl: body.imageUrl ?? null,
      sourceUrl: body.sourceUrl ?? null,
      isFeatured: body.isFeatured ?? false,
      status: body.status ?? Status.DRAFT,
    },
  })

  return Response.json({ data: event }, { status: 201 })
}
