import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { Status } from '@/generated/prisma/client'

type RouteCtx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({ data: event })
}

export async function PUT(request: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  const body = await request.json()

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.dateStart !== undefined && { dateStart: new Date(body.dateStart) }),
      ...(body.dateEnd !== undefined && { dateEnd: body.dateEnd ? new Date(body.dateEnd) : null }),
      ...(body.locationName !== undefined && { locationName: body.locationName }),
      ...(body.locationAddress !== undefined && { locationAddress: body.locationAddress }),
      ...(body.latitude !== undefined && { latitude: body.latitude }),
      ...(body.longitude !== undefined && { longitude: body.longitude }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.sourceUrl !== undefined && { sourceUrl: body.sourceUrl }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.status !== undefined && { status: body.status }),
    },
  })

  return Response.json({ data: event })
}

export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params

  await prisma.event.update({
    where: { id },
    data: { status: Status.ARCHIVED },
  })

  return new Response(null, { status: 204 })
}
