import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Mentur AI | Expert Academic Mentorship',
  description: 'Elevate your learning with AI-powered assessment generation and essay evaluation.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mentur AI',
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: 'Yrpw6wUx_g6el5DcT-xKW2n-vlZy0-agXW9nHlYjrj0',
  },
};

export const viewport: Viewport = {
  themeColor: '#9333ea',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="Yrpw6wUx_g6el5DcT-xKW2n-vlZy0-agXW9nHlYjrj0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://placehold.co/180x180/9333ea/ffffff?text=M" />
        <script dangerouslySetInnerHTML={{__html: "if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}"}} />
      </head>
      <body className="font-body antialiased transition-colors duration-300">
        <FirebaseClientProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
