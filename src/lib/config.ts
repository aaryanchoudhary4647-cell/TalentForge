/**
 * TalentForge Config
 * Automatically detects if backend keys are present.
 * If not → uses mock data so frontend works immediately.
 * When teammate adds keys → live mode activates with zero code changes.
 */

export const IS_MOCK_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
  !isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)

export const HAS_OPENAI =
  !!process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== 'your_openai_api_key'

function isValidUrl(string: string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export const config = {
  isMockMode: IS_MOCK_MODE,
  hasOpenAI: HAS_OPENAI,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
}
