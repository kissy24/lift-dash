import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WorkoutSessionCard } from '@/components/workouts/WorkoutSessionCard'
import { createClient } from '@/lib/supabase/server'
import { workoutDateSchema } from '@/lib/validations/workout'
import type { WorkoutExerciseView, WorkoutSessionView } from '@/lib/workouts/types'

type WorkoutDatePageProps = {
  params: Promise<{ date: string }>
}

export default async function WorkoutDatePage({ params }: WorkoutDatePageProps) {
  const routeParams = await params
  const parsedDate = workoutDateSchema.safeParse(routeParams.date)
  if (!parsedDate.success) notFound()

  const supabase = await createClient()
  const [sessionsResult, exercisesResult] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select(
        'id,date,notes,created_at,workout_sets(id,exercise_id,set_number,weight,reps,exercise:exercises(id,name))'
      )
      .eq('date', parsedDate.data)
      .order('created_at', { ascending: true }),
    supabase.from('exercises').select('*').order('name', { ascending: true }),
  ])

  if (sessionsResult.error) throw new Error('トレーニング記録を取得できませんでした')
  if (exercisesResult.error) throw new Error('種目一覧を取得できませんでした')
  if (sessionsResult.data.length === 0) notFound()

  const sessions: WorkoutSessionView[] = sessionsResult.data.map((session) => {
    const groupedExercises = new Map<string, WorkoutExerciseView>()
    session.workout_sets
      .sort((a, b) => a.set_number - b.set_number)
      .forEach((workoutSet) => {
        if (!workoutSet.exercise) throw new Error('種目情報を取得できませんでした')
        const current = groupedExercises.get(workoutSet.exercise_id) ?? {
          exerciseId: workoutSet.exercise_id,
          exerciseName: workoutSet.exercise.name,
          sets: [],
        }
        current.sets.push({
          id: workoutSet.id,
          setNumber: workoutSet.set_number,
          weight: workoutSet.weight,
          reps: workoutSet.reps,
        })
        groupedExercises.set(workoutSet.exercise_id, current)
      })

    return {
      id: session.id,
      date: session.date,
      notes: session.notes,
      exercises: [...groupedExercises.values()],
    }
  })

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {format(parseISO(parsedDate.data), 'yyyy年M月d日')}の記録
          </h1>
          <p className="text-sm text-muted-foreground">
            セッション全体またはセット単位で内容を編集できます。
          </p>
        </div>
        <div className="flex gap-4">
          <Link className="text-sm font-medium text-primary hover:underline" href="/log">
            一覧へ戻る
          </Link>
          <Link className="text-sm font-medium text-primary hover:underline" href="/log/new">
            記録を追加
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        {sessions.map((session, index) => (
          <WorkoutSessionCard
            key={session.id}
            session={session}
            exercises={exercisesResult.data}
            sessionNumber={index + 1}
          />
        ))}
      </div>
    </main>
  )
}
