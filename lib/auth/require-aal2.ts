import type { SupabaseClient } from '@supabase/supabase-js'

import type { ActionFailure } from '@/lib/actions/action-result'
import type { Database } from '@/lib/supabase/database.types'

export async function requireAal2(
  supabase: SupabaseClient<Database>
): Promise<ActionFailure | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return { success: false, error: { message: '認証セッションが無効です' } }
  }

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (assuranceError || assurance.currentLevel !== 'aal2') {
    return { success: false, error: { message: 'MFA認証が必要です' } }
  }

  return null
}
