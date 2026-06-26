'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import InvoiceForm from '@/components/InvoiceForm';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SplashScreen } from '@/components/SplashScreen';

export default function WorkspacePage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenWorkspaceSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenWorkspaceSplash', 'true');
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {!showSplash && (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-white to-sky-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
          <Header />
          <main className="flex-grow">
            <InvoiceForm />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
