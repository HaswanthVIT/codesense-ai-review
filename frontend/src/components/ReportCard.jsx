import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const ReportCard = ({ title, content, isList = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mb-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-xl font-semibold text-gray-300">{title}</h3>
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }}>
          <ChevronDown className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {isList ? (
                <ul className="list-disc list-inside space-y-2 text-gray-400 pl-2">
                  {content.split(/\d+\.\s|\*\s|- /).filter(line => line.trim()).map((line, index) => (
                    <li key={index}>{line.trim()}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 whitespace-pre-line">{content}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};