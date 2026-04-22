import type React from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Poppins, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/components/providers/language-provider';
import { StreakProvider } from '@/components/providers/streak-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TenseyChat } from '@/components/chat/tensey-chat';
import { GlobalGamification } from '@/components/global-gamification';
import { Toaster } from '@/components/ui/sonner';
import { OnboardingGuard } from '@/components/providers/onboarding-guard';
import { PremiumApprover } from '@/components/premium-approver';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'AI English Game – Gamified English Learning with 26 AI Game Modes',
    template: '%s | AI English Game',
  },
  description:
    'Master English through AI-powered games, quizzes, speech challenges, and interactive exercises. 26 game modes, CEFR levels, global leaderboard, and multilingual support.',
  keywords: ['English learning', 'AI grammar', 'CEFR', 'gamified learning', 'English games', 'ESL'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI English Game',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1b4b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}');
        `}</Script>
      </head>
      <body className={`${poppins.className} ${geistMono.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <OnboardingGuard>
                <LanguageProvider>
                  <StreakProvider>
                    <div className="min-h-screen flex flex-col">
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <TenseyChat />
                    <GlobalGamification />
                    <PremiumApprover />
                    <Toaster richColors position="top-right" />
                    <Analytics />
                  </StreakProvider>
                </LanguageProvider>
              </OnboardingGuard>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
