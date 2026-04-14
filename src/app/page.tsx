import { Suspense } from 'react'
import EventFilters from '@/components/events/EventFilters'
import EventList from '@/components/events/EventList'

type SearchParams = Promise<{
  category?: string
  date?: string
  search?: string
  page?: string
}>

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const filters = {
    category: params.category,
    date: params.date,
    search: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            Karlsruhe Events
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Alle Veranstaltungen in Karlsruhe auf einen Blick
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        <EventFilters />

        <Suspense
          key={JSON.stringify(filters)}
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white h-64 animate-pulse" />
              ))}
            </div>
          }
        >
          <EventList filters={filters} />
        </Suspense>
      </main>
    </div>
  )
}
