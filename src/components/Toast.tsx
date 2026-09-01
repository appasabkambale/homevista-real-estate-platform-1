import React from 'react';
import { useProperties } from '../context/PropertyContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toastMessage } = useProperties();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const bgColors = {
    success: 'bg-white border-emerald-200 shadow-emerald-500/10',
    error: 'bg-white border-rose-200 shadow-rose-500/10',
    info: 'bg-white border-blue-200 shadow-blue-500/10'
  };

  return (
    <div id="app-toast-container" className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl pointer-events-auto max-w-md ${bgColors[toastMessage.type]}`}
        >
          {icons[toastMessage.type]}
          <p className="text-sm font-medium text-slate-800">{toastMessage.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
