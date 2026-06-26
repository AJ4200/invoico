'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Mail,
  ReceiptText,
  WalletCards,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LogoMark } from '@/components/brand/LogoMark';
import { formatMoney } from '@/utils/currency';

const workflow = [
  'Create branded invoices',
  'Send a prepared email draft',
  'Let clients view invoices',
  'Record PayShap or bank payments',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
          <div className="absolute inset-0 opacity-70 dark:opacity-40">
            <div className="h-full w-full bg-[radial-gradient(circle_at_18%_18%,#bae6fd_0%,transparent_28%),radial-gradient(circle_at_82%_12%,#bbf7d0_0%,transparent_26%),linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#e0f2fe_100%)] dark:bg-[radial-gradient(circle_at_18%_18%,#075985_0%,transparent_28%),radial-gradient(circle_at_82%_12%,#065f46_0%,transparent_26%),linear-gradient(135deg,#020617_0%,#0c0a09_55%,#0f172a_100%)]" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_0.9fr] lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 dark:border-sky-900 dark:bg-sky-950/70 dark:text-sky-200">
                <LogoMark className="h-6 w-6" />
                Invoicing, portals, and manual payment tracking
              </div>
              <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-stone-950 dark:text-white md:text-6xl">
                Invoico
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-300">
                Create invoices, open client-ready email drafts, give clients a portal to view what they owe, and keep PayShap or bank transfer payments organized.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/workspace">
                  <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Create Invoice
                  </Button>
                </Link>
                <Link href="/business">
                  <Button variant="outline" size="lg" leftIcon={<Building2 className="h-5 w-5" />}>
                    Business Login
                  </Button>
                </Link>
                <Link href="/client">
                  <Button variant="ghost" size="lg" leftIcon={<LockKeyhole className="h-5 w-5" />}>
                    Client Login
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                {workflow.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />
              <Card variant="elevated" className="relative overflow-hidden border border-stone-200 bg-white/95 p-0 dark:border-stone-700 dark:bg-stone-900/95">
                <div className="border-b border-stone-200 p-5 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                        <ReceiptText className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">
                          Invoice INV-20260626-AC
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Acme Consulting
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Unpaid
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4 p-5">
                    {[
                      ['Website build', 'R 8 500,00'],
                      ['Monthly care plan', 'R 1 200,00'],
                      ['Launch support', 'R 950,00'],
                    ].map(([label, amount]) => (
                      <div key={label} className="flex items-center justify-between rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-stone-400" />
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                            {label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {amount}
                        </span>
                      </div>
                    ))}
                    <div className="rounded-xl bg-sky-600 p-5 text-white">
                      <p className="text-sm opacity-85">Amount due</p>
                      <p className="mt-1 text-3xl font-bold">{formatMoney(10650, 'ZAR')}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-900 md:border-l md:border-t-0">
                    <p className="mb-4 text-sm font-bold text-stone-800 dark:text-stone-100">
                      Portal activity
                    </p>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-stone-800">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-100">
                          <Mail className="h-4 w-4 text-sky-500" />
                          Email draft ready
                        </div>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                          Includes portal link and payment reference
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-stone-800">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-100">
                          <WalletCards className="h-4 w-4 text-emerald-500" />
                          PayShap / bank payment
                        </div>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                          Business confirms receipt manually
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ['Invoice workspace', 'Build branded invoices, recurring schedules, PDFs, and email drafts.'],
              ['Business dashboard', 'Filter invoices, confirm manual collections, and review payment history.'],
              ['Client dashboard', 'Clients view invoices, download PDFs, copy references, and send proof.'],
            ].map(([title, copy]) => (
              <Card key={title} variant="elevated" className="p-6">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{copy}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
