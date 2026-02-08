'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Calendar, Package, Banknote, Tag, ChevronDown } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface Service {
  description: string;
  date: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface ServiceItemProps {
  service: Service;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
}) => {
  const totalDisplay = `R ${service.total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-stone-50 dark:bg-stone-800/50 rounded-xl border-2 border-stone-200 dark:border-stone-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors overflow-hidden"
    >
      <div
        className="flex items-center justify-between gap-4 p-4 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">
              Service #{index + 1}
              <span className="font-normal text-stone-600 dark:text-stone-400 ml-2">
                — {service.description || 'No description'}
              </span>
            </h4>
          </div>
          {!isExpanded && (
            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex-shrink-0">
              {totalDisplay}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          leftIcon={<Trash2 className="w-4 h-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 flex-shrink-0"
        >
          Remove
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4 pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="md:col-span-2">
          <Input
            label="Description"
            name="description"
            value={service.description}
            onChange={(e) => onChange(index, e)}
            placeholder="e.g., Website Development"
            icon={<Package className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Date of Service"
          type="date"
          name="date"
          value={service.date}
          onChange={(e) => onChange(index, e)}
          icon={<Calendar className="w-4 h-4" />}
          required
        />

        <Input
          label="Quantity/Hours"
          type="number"
          name="quantity"
          value={service.quantity}
          onChange={(e) => onChange(index, e)}
          placeholder="0"
          min="0"
          step="0.01"
          required
        />

        <Input
          label="Unit Price (R)"
          type="number"
          name="unitPrice"
          value={service.unitPrice}
          onChange={(e) => onChange(index, e)}
          placeholder="0.00"
          min="0"
          step="0.01"
          icon={<Banknote className="w-4 h-4" />}
          required
        />

        <div>
          <Input
            label="Discount (R)"
            type="number"
            name="discount"
            value={service.discount}
            onChange={(e) => onChange(index, e)}
            placeholder="0.00"
            min="0"
            step="0.01"
            icon={<Tag className="w-4 h-4" />}
          />
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            e.g. free demo: set unit price, then discount same amount
          </p>
        </div>

        <div className="md:col-span-2 bg-sky-50 dark:bg-sky-900/30 p-4 rounded-lg border-2 border-sky-200 dark:border-sky-800">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Total Amount
          </label>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            R {service.total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
