import { MfaChallengeForm } from '@/components/forms/MfaChallengeForm'
import { LogoutButton } from '@/components/forms/LogoutButton'
import { AuthCard } from '@/components/layout/AuthCard'

export default function MfaVerifyPage() {
  return (
    <AuthCard title="本人確認" description="認証アプリに表示されているコードを入力してください。">
      <MfaChallengeForm />
      <div className="border-t pt-5">
        <LogoutButton />
      </div>
    </AuthCard>
  )
}
