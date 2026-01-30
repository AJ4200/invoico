import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'bordered' | 'elevated';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white rounded-xl shadow-md',
    bordered: 'bg-white rounded-xl border-2 border-stone-200',
    elevated: 'bg-white rounded-xl shadow-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {}}
      transition={{ duration: 0.3 }}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
