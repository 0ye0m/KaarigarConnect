'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'customer' | 'worker';
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return key && key !== 'YOUR_SUPABASE_ANON_KEY_HERE' && key.length > 20;
};

export function useAuth() {
  const { user, setUser, setLoading, logout: storeLogout, isAuthenticated, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // Sync user on mount
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Simple registration (works without Supabase Auth)
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          supabase_id: crypto.randomUUID(), // Generate a UUID for the user
          full_name: credentials.full_name,
          phone: credentials.phone,
          role: credentials.role || 'customer',
          password: credentials.password, // Include password for simple mode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after registration (simple mode)
      if (data.user) {
        setUser(data.user);
      }

      return { 
        success: true, 
        user: data.user 
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  // Simple login (works without Supabase Auth)
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        throw new Error(data.error || 'Login failed');
      }

      if (data.user) {
        setUser(data.user);
      }

      return data.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  // Sign out
  const logout = useCallback(async () => {
    storeLogout();
  }, [storeLogout]);

  // Resend verification email (placeholder for Supabase mode)
  const resendVerificationEmail = useCallback(async (email: string) => {
    // In simple mode, no email verification
    return { success: true };
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    setError,
    resendVerificationEmail,
  };
}
