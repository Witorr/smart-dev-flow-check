import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()
  const lastNavigationRef = useRef<string | null>(null)
  const isNavigatingRef = useRef(false)

  const debounceNavigation = useCallback((path: string, options = {}) => {
    if (lastNavigationRef.current === path) return;
    
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    lastNavigationRef.current = path;
    isNavigatingRef.current = true;
    
    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path, { ...options, replace: true });
      lastNavigationRef.current = null;
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }, 100);
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      setIsAuthenticated(!!session)
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      await checkAuth()
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      const isAuth = !!session
      setIsAuthenticated(isAuth)
      
      // Only redirect automatically for login/dashboard routes
      const currentPath = location.pathname
      if (isAuth && currentPath === '/login') {
        debounceNavigation('/dashboard')
      } else if (!isAuth && 
                (currentPath === '/dashboard' || 
                 currentPath === '/create-project')) {
        debounceNavigation('/login')
      }
    })

    return () => {
      mounted = false
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
      subscription.unsubscribe()
    }
  }, [location.pathname, debounceNavigation, checkAuth])

  const navigateToProject = (projectId: string) => {
    if (isNavigatingRef.current) return;
    navigate(`/project/${projectId}`);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message)
      }
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
      
      // Clear any navigation flags
      isNavigatingRef.current = false;
      lastNavigationRef.current = null;
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Use immediate navigation instead of debounced to ensure logout responsiveness
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message)
      }
      throw error
    }
  }

  return {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    navigateToProject
  }
} 