
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'DISCATE AI | Elite Academic Mentorship',
  description: 'DISCATE AI is an intelligent academic mentor providing AI-powered assessments and personalized learning journeys.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/512x512.png', sizes: '512x512', type: 'image/png' }
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DISCATE AI',
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DISCATE AI",
    "url": "https://discate.com",
    "logo": "https://discate.com/icons/512x512.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "aftabghaswalaofficial@gmail.com",
      "contactType": "customer support"
    },
    "description": "DISCATE AI is an elite academic mentorship platform providing AI-powered assessments and personalized learning journeys.",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DISCATE AI",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "EducationalApplication",
    "description": "DISCATE AI is an AI-powered education platform providing personalized assessments, essay evaluation, and elite mentorship.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/512x512.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
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
