import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn() },
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() })),
  })),
}))
