import { MfaEnrollmentForm } from '@/components/forms/MfaEnrollmentForm'
import { LogoutButton } from '@/components/forms/LogoutButton'
import { AuthCard } from '@/components/layout/AuthCard'

export default function MfaEnrollmentPage() {
  return (
    <AuthCard title="MFAの設定" description="認証アプリを使った2段階認証を設定します。">
      <MfaEnrollmentForm />
      <div className="border-t pt-5">
        <LogoutButton />
      </div>
    </AuthCard>
  )
}
