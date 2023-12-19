import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/Providers'
import { Toaster } from '@/components/ui/toaster'

const lexend = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Course Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        lexend.className, "antialiased min-h-screen pt-16"
      )}>
        <ThemeProvider>
          <Navbar></Navbar>
          {children}
          <Toaster />
        </ThemeProvider>
        </body>
    </html>
  )
}
