'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If not logged in, middleware handles redirection to home/login
    if (!user) return;

    // List of paths that DON'T require onboarding
    const publicPaths = ['/', '/onboarding', '/admin-grant'];
    const isPublicPath = publicPaths.includes(pathname);

    if (profile && !profile.isOnboarded && !isPublicPath) {
      router.push('/onboarding');
    }
    
    // If they are on onboarding but already finished, send them to dashboard
    if (profile?.isOnboarded && pathname === '/onboarding') {
      router.push('/dashboard');
    }
  }, [profile, loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flicker of protected content for non-onboarded users
  const publicPaths = ['/', '/onboarding', '/admin-grant'];
  if (user && profile && !profile.isOnboarded && !publicPaths.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
