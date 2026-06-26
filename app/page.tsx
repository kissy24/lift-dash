export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 py-10">
      <section className="grid flex-1 content-center gap-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">LiftDash</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Track your sets, visualize your gains.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            A personal strength training log and analytics dashboard.
          </p>
        </div>
      </section>
    </main>
  )
}
