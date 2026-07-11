import Link from 'next/link'

import type { PersonalRecord } from '@/lib/workouts/personal-records'

type PersonalRecordCardsProps = {
  records: PersonalRecord[]
}

export function PersonalRecordCards({ records }: PersonalRecordCardsProps) {
  return (
    <section className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-xl font-semibold">自己ベスト</h2>
      {records.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          自己ベストを表示できる記録がまだありません
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <article className="rounded-lg border bg-background p-4" key={record.exerciseId}>
              <h3 className="font-semibold">{record.exerciseName}</h3>
              <p className="mt-3 text-2xl font-semibold text-primary">
                {record.weight.toLocaleString('ja-JP')} kg
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{record.reps} reps</p>
              <Link
                aria-label={`${record.date}の記録を見る`}
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                href={`/log/${record.date}`}
              >
                {record.date}
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
