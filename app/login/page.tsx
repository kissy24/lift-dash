import { LoginForm } from '@/components/forms/LoginForm'
import { AuthCard } from '@/components/layout/AuthCard'

export default function LoginPage() {
  return (
    <AuthCard title="ログイン" description="メールアドレスとパスワードを入力してください。">
      <LoginForm />
    </AuthCard>
  )
}
