'use client';

import { motion } from 'framer-motion';
import { Github, Heart, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-stone-900 to-stone-800 text-white py-8 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2"
          >
            <Code className="w-5 h-5 text-sky-400" />
            <span className="text-sm">Built with passion and precision</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm">Made with</span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span className="text-sm">by</span>
            <motion.a
              href="https://github.com/aj4200"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="font-medium">@aj4200</span>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-stone-400"
          >
            © {new Date().getFullYear()} Invoico. All rights reserved.
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 pt-6 border-t border-stone-700 text-center text-xs text-stone-500"
        >
          Professional invoice generation made simple and beautiful
        </motion.div>
      </div>
    </motion.footer>
  );
};
