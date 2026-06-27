'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { verifyTotpChallengeAction } from '@/lib/actions/auth'

export function MfaChallengeForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)

    startTransition(async () => {
      const result = await verifyTotpChallengeAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.replace(result.data.redirectTo)
      router.refresh()
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="code">6桁の認証コード</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          autoFocus
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? '確認中…' : '認証する'}
      </Button>
    </form>
  )
}
