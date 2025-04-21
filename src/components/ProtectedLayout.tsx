import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import AuthComponent from './Auth'
import { saveGoogleAccessToken } from '../utils/googleToken';

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      // Salva o access_token do Google se existir
      if (session?.provider_token) {
        saveGoogleAccessToken(session.provider_token);
      } else if (session?.user?.identities?.[0]?.identity_data?.access_token) {
        saveGoogleAccessToken(session.user.identities[0].identity_data.access_token);
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      // Salva o access_token do Google se existir
      if (session?.provider_token) {
        saveGoogleAccessToken(session.provider_token);
      } else if (session?.user?.identities?.[0]?.identity_data?.access_token) {
        saveGoogleAccessToken(session.user.identities[0].identity_data.access_token);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <AuthComponent />
  }

  return <>{children}</>
} 