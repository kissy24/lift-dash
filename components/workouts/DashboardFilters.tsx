'use client'

import { usePathname, useRouter } from 'next/navigation'

import {
  DASHBOARD_RANGE_OPTIONS,
  type DashboardFiltersValue,
  type DashboardRange,
} from '@/lib/workouts/dashboard-filters'

type DashboardFiltersProps = {
  filters: DashboardFiltersValue
  exercises: Array<{ id: string; name: string }>
}

export function DashboardFilters({ filters, exercises }: DashboardFiltersProps) {
  const pathname = usePathname()
  const router = useRouter()

  function navigate(nextFilters: DashboardFiltersValue) {
    const query = new URLSearchParams({ range: nextFilters.range })
    if (nextFilters.exerciseId) query.set('exercise', nextFilters.exerciseId)
    router.push(`${pathname}?${query.toString()}`)
  }

  return (
    <section className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-xl font-semibold">表示フィルター</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          期間
          <select
            className="rounded-md border bg-background px-3 py-2"
            onChange={(event) =>
              navigate({ ...filters, range: event.target.value as DashboardRange })
            }
            value={filters.range}
          >
            {DASHBOARD_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          種目
          <select
            className="rounded-md border bg-background px-3 py-2"
            onChange={(event) => navigate({ ...filters, exerciseId: event.target.value || null })}
            value={filters.exerciseId ?? ''}
          >
            <option value="">全種目</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
