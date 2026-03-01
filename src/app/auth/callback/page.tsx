'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      const supabase = getSupabaseClient();
      
      try {
        // Exchange code for session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_callback_error');
          return;
        }

        if (session?.user) {
          // Sync profile with our database
          const response = await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              supabase_id: session.user.id,
            }),
          });

          if (response.ok) {
            // Redirect to home page
            router.push('/');
          } else {
            console.error('Failed to sync profile');
            router.push('/?error=profile_sync_error');
          }
        } else {
          // No session, redirect to login
          router.push('/');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        router.push('/?error=unknown_error');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Completing sign in...
        </h1>
        <p className="text-muted-foreground">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
}
