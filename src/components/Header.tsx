'use client';

import { motion } from 'framer-motion';
import { FileText, Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const GITHUB_URL = 'https://github.com/aj4200';
const GITHUB_USER = '@aj4200';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-b border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                Invoico
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Professional Invoice Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{GITHUB_USER}</span>
            </motion.a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
