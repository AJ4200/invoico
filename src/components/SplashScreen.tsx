'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LogoMark } from './brand/LogoMark';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 180);
          return 100;
        }
        return prev + 5;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-stone-950"
    >
      <div className="w-full max-w-sm px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center"
        >
          <motion.div
            animate={{ opacity: [0.16, 0.28, 0.16], scale: [1, 1.16, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl bg-sky-400 blur-2xl"
          />
          <LogoMark className="relative h-16 w-16" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Invoico
          </h1>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Opening workspace
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
