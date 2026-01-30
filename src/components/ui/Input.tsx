import { InputHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {label && (
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 ${icon ? 'pl-10' : ''}
              bg-white border-2 border-stone-200 rounded-lg
              text-stone-900 placeholder-stone-400
              focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none
              transition-all duration-200
              disabled:bg-stone-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
