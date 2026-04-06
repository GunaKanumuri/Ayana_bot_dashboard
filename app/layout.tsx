import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AYANA — Know your parents are okay, every single day',
  description:
    'AYANA sends a warm voice message to your parents each morning on WhatsApp — in their language. Built for NRI families who worry about parents back home.',
  openGraph: {
    title: 'AYANA — Know your parents are okay, every single day',
    description: 'Daily WhatsApp check-ins for your parents. In their language. Zero effort for them.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
