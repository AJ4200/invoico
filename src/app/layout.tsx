import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Invoico - Professional Invoice Generator',
  description: 'Create professional invoices in minutes with Invoico. Modern, clean, and easy-to-use invoice generator for freelancers and businesses.',
  keywords: ['invoice', 'generator', 'professional', 'invoicing', 'freelance', 'business'],
  authors: [{ name: 'aj4200', url: 'https://github.com/aj4200' }],
  creator: 'aj4200',
  openGraph: {
    title: 'Invoico - Professional Invoice Generator',
    description: 'Create professional invoices in minutes',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){const t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',t==='dark'||(!t&&d))})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="fixed top-4 right-4 z-40">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
