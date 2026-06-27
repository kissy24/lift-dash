import { LogoutButton } from '@/components/forms/LogoutButton'

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-10">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-3xl font-semibold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">トレーニング記録をここから確認できます。</p>
        </div>
        <LogoutButton />
      </header>
    </main>
  )
}
