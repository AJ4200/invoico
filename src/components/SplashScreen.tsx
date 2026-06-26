'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Mail, ReceiptText, WalletCards } from 'lucide-react';
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
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,#e0f2fe_0%,#ffffff_38%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_50%_20%,#0c4a6e_0%,#0c0a09_45%,#020617_100%)] flex items-center justify-center z-50"
    >
      <div className="w-full max-w-md px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.2, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-[2rem] bg-sky-300 blur-xl dark:bg-sky-700"
          />
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="relative rounded-[1.35rem] shadow-2xl shadow-sky-700/20"
          >
            <LogoMark className="h-24 w-24" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -7, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-4 top-2 rounded-full bg-white p-2 shadow-lg dark:bg-stone-800"
          >
            <Mail className="h-5 w-5 text-sky-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 7, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
            className="absolute -left-4 bottom-2 rounded-full bg-white p-2 shadow-lg dark:bg-stone-800"
          >
            <WalletCards className="h-5 w-5 text-emerald-600" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Invoico
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
            Preparing your invoice workspace
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mx-auto rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-xl shadow-sky-900/5 backdrop-blur dark:border-stone-700 dark:bg-stone-900/80"
        >
          <div className="mb-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-sky-600" />
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                Loading tools
              </span>
            </div>
            <span className="text-sm font-semibold text-sky-600">{progress}%</span>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ width: '35%' }}
                animate={{ width: index === 0 ? '88%' : index === 1 ? '72%' : '54%' }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: index * 0.18,
                }}
                className="h-2 rounded-full bg-stone-200 dark:bg-stone-700"
              />
            ))}
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500"
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Invoice, portal, and payment tools
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
