import { motion } from 'framer-motion';
import { ReceiptText } from 'lucide-react';

interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading',
  size = 'md',
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className={`relative ${sizes[size]}`}>
        <div className="absolute inset-0 rounded-2xl bg-sky-100 shadow-inner dark:bg-sky-950/60" />
        <motion.div
          animate={{ y: ['-20%', '95%'] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-2 right-2 top-2 h-1 rounded-full bg-sky-500/70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <ReceiptText className="h-1/2 w-1/2 text-sky-700 dark:text-sky-300" />
        </div>
        <motion.div
          animate={{ scale: [0.94, 1.02, 0.94], opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl border-2 border-sky-300 dark:border-sky-700"
        />
      </div>
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${textSizes[size]} text-stone-600 dark:text-stone-400 font-medium`}
        >
          {label}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-md dark:bg-stone-950/90">
        <div className="rounded-2xl border border-stone-200 bg-white/90 px-8 py-7 shadow-2xl shadow-sky-950/10 dark:border-stone-700 dark:bg-stone-900/90">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
