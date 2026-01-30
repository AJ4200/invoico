'use client';

import { motion } from 'framer-motion';
import { Trash2, Calendar, Package, DollarSign } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface Service {
  description: string;
  date: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ServiceItemProps {
  service: Service;
  index: number;
  onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  onChange,
  onRemove,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-stone-50 p-6 rounded-xl border-2 border-stone-200 hover:border-sky-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-stone-800">
          Service #{index + 1}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          leftIcon={<Trash2 className="w-4 h-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          label="Unit Price ($)"
          type="number"
          name="unitPrice"
          value={service.unitPrice}
          onChange={(e) => onChange(index, e)}
          placeholder="0.00"
          min="0"
          step="0.01"
          icon={<DollarSign className="w-4 h-4" />}
          required
        />

        <div className="bg-sky-50 p-4 rounded-lg border-2 border-sky-200">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Total Amount
          </label>
          <p className="text-2xl font-bold text-sky-600">
            ${service.total.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
