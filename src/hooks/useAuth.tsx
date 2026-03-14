'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { IS_MOCK_MODE } from '@/lib/config'
import { MOCK_USER } from '@/lib/mock-data'

type UserRole = 'hr' | 'candidate' | 'interviewer'

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  org_id?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isMockMode: boolean
  login: (email: string, password: string, role?: UserRole) => Promise<{ error?: string }>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ error?: string }>
  loginWithGoogle: () => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (authUser: any) => {
    try {
      console.log('🔍 Loading user profile for auth user:', authUser.id)
      
      const { supabase } = await import('@/lib/supabase')
      
      // Get role from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (roleError?.code === 'PGRST116') {
        // No role record found - assume hr as default and continue
        console.warn('⚠️ No user role found, using default: hr')
        const userProfile: AuthUser = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email.split('@')[0],
          role: 'hr' as UserRole,
        }
        console.log('✅ User profile loaded (default):', userProfile)
        setUser(userProfile)
        return
      }

      if (roleError) {
        console.error('❌ Failed to fetch user role:', roleError)
        setUser(null)
        return
      }

      if (!roleData) {
        console.error('❌ No role data returned')
        setUser(null)
        return
      }

      const role = roleData.role
      let profile = null

      // Get profile based on role
      if (role === 'hr') {
        const { data, error } = await supabase
          .from('hr_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (error?.code !== 'PGRST116') {
          console.log('HR profile fetch:', error ? 'error' : 'success')
        }
        profile = data
      } else {
        const { data, error } = await supabase
          .from('applicant_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (error?.code !== 'PGRST116') {
          console.log('Applicant profile fetch:', error ? 'error' : 'success')
        }
        profile = data
      }

      // Build user profile - use profile data if available, otherwise use auth user data
      const userProfile: AuthUser = {
        id: authUser.id,  // This is the unique ID from Supabase auth
        email: authUser.email,
        name: profile?.company_name || 
              (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
              authUser.email.split('@')[0],
        role: role as UserRole,
        org_id: profile?.org_id,
      }
      console.log('✅ User profile loaded:', userProfile)
      setUser(userProfile)
    } catch (err) {
      console.error('❌ Error loading user profile:', err)
      setUser(null)
    }
  }

  useEffect(() => {
    if (IS_MOCK_MODE) {
      // In mock mode, check localStorage for a "logged in" state
      const stored = localStorage.getItem('tf_mock_user')
      if (stored) {
        try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
      }
      setLoading(false)
      return
    }

    // Live mode — use Supabase
    const initSupabase = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadUserProfile(session.user)
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            await loadUserProfile(session.user)
          } else {
            setUser(null)
          }
        })
      } catch (err) {
        console.error('Supabase init error:', err)
      }
      setLoading(false)
    }
    initSupabase()
  }, [])

  const login = async (email: string, _password: string, role?: UserRole) => {
    if (IS_MOCK_MODE) {
      const mockUser = {
        ...MOCK_USER,
        email,
        role: role || 'hr',
        name: email.split('@')[0],
      }
      setUser(mockUser)
      localStorage.setItem('tf_mock_user', JSON.stringify(mockUser))
      return {}
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithPassword({ email, password: _password })
      if (error) return { error: error.message }
      return {}
    } catch {
      return { error: 'Login failed. Please try again.' }
    }
  }

  const signup = async (name: string, email: string, _password: string, role: UserRole) => {
    if (IS_MOCK_MODE) {
      const mockUser = { ...MOCK_USER, name, email, role }
      setUser(mockUser)
      localStorage.setItem('tf_mock_user', JSON.stringify(mockUser))
      return {}
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.auth.signUp({ email, password: _password })
      if (error) return { error: error.message }
      return {}
    } catch {
      return { error: 'Signup failed. Please try again.' }
    }
  }

  const loginWithGoogle = async () => {
    if (IS_MOCK_MODE) {
      const mockUser = { ...MOCK_USER, name: 'Mock Google User', role: 'candidate' as UserRole }
      setUser(mockUser)
      localStorage.setItem('tf_mock_user', JSON.stringify(mockUser))
      return {}
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) return { error: error.message }
      return {} // The actual redirect will handle the rest
    } catch {
      return { error: 'Google login failed. Please try again.' }
    }
  }

  const logout = async () => {
    if (IS_MOCK_MODE) {
      localStorage.removeItem('tf_mock_user')
      setUser(null)
      return
    }
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.auth.signOut()
      setUser(null)
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isMockMode: IS_MOCK_MODE, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
