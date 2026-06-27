'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { logoutAction } from '@/lib/actions/auth'

export function LogoutButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function logout() {
    setError(null)
    startTransition(async () => {
      const result = await logoutAction()
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.replace(result.data.redirectTo)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <Button
        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
        onClick={logout}
        disabled={isPending}
      >
        {isPending ? 'ログアウト中…' : 'ログアウト'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
