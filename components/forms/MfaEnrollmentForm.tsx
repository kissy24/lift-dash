'use client'

import Image from 'next/image'
import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { startTotpEnrollmentAction, verifyTotpEnrollmentAction } from '@/lib/actions/auth'

type Enrollment = {
  factorId: string
  qrCode: string
  secret: string
}

export function MfaEnrollmentForm() {
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function startEnrollment() {
    setError(null)
    startTransition(async () => {
      const result = await startTotpEnrollmentAction()
      if (!result.success) {
        setError(result.error.message)
        return
      }
      setEnrollment(result.data)
    })
  }

  function verifyEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!enrollment) return

    const formData = new FormData(event.currentTarget)
    formData.set('factorId', enrollment.factorId)
    setError(null)
    startTransition(async () => {
      const result = await verifyTotpEnrollmentAction(formData)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.replace(result.data.redirectTo)
      router.refresh()
    })
  }

  if (!enrollment) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          認証アプリにLiftDashを登録し、ログイン時の本人確認を有効にします。
        </p>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" onClick={startEnrollment} disabled={isPending}>
          {isPending ? '準備中…' : 'MFAを設定する'}
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={verifyEnrollment}>
      <div className="flex justify-center rounded-md bg-white p-4">
        <Image
          src={enrollment.qrCode}
          alt="認証アプリ登録用QRコード"
          width={192}
          height={192}
          unoptimized
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">QRコードを読めない場合の設定キー</p>
        <code className="block break-all rounded-md bg-muted p-3 text-sm">{enrollment.secret}</code>
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">6桁の認証コード</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? '確認中…' : 'MFAを有効にする'}
      </Button>
    </form>
  )
}
