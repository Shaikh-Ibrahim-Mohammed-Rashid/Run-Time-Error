import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RemoveButtonProps {
  onClick: () => void;
}

export const RemoveButton = ({ onClick }: RemoveButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
  >
    <X className="w-4 h-4" />
  </motion.button>
); 