'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import InvoiceForm from '@/components/InvoiceForm';
import { SplashScreen } from '@/components/SplashScreen';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {!showSplash && (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-white to-sky-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
          <main className="flex-grow">
            <InvoiceForm />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
