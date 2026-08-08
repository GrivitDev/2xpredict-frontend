import type { Metadata, Viewport } from 'next';

import './globals.css';

import QueryProvider from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { SEO } from '@/config/seo';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';



export const metadata: Metadata = {
  metadataBase: new URL(SEO.url),

  title: {
    default: SEO.title,
    template: `%s | ${SEO.title}`,
  },

  description: SEO.description,

  keywords: SEO.keywords,

  alternates: {
    canonical: SEO.url,
  },

  applicationName: 'Sure Predict Pro',

  authors: [
    {
      name: 'Sure Predict Pro',
      url: SEO.url,
    },
  ],

  creator: 'Sure Predict Pro',

  publisher: 'Sure Predict Pro',

  category: 'Sports',

  manifest: '/logo/site.webmanifest',

  icons: {
    icon: [
      {
        url: '/logo/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/logo/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logo/favicon.ico',
      },
    ],

    shortcut: '/logo/favicon.ico',

    apple: [
      {
        url: '/logo/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  },

  openGraph: {
    title: SEO.title,

    description: SEO.description,

    url: SEO.url,

    siteName: SEO.title,

    locale: 'en_US',

    type: 'website',

    images: [
      {
        url: SEO.image,
        width: 1200,
        height: 630,
        alt: 'Sure Predict Pro',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title: SEO.title,

    description: SEO.description,

    images: [SEO.image],
  },

  robots: {
    index: true,

    follow: true,

    nocache: false,

    googleBot: {
      index: true,

      follow: true,

      'max-image-preview': 'large',

      'max-snippet': -1,

      'max-video-preview': -1,
    },
  },

  appleWebApp: {
    capable: true,

    title: 'Sure Predict Pro',

    statusBarStyle: 'black-translucent',
  },

  formatDetection: {
    telephone: false,

    email: false,

    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#ffffff',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#020617',
    },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
<body className={cn(
  "min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300, "
  )}
  >
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className:
                      'border border-border bg-card text-foreground',
                  }}
                />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}