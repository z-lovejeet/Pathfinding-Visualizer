'use client';

import { motion } from 'framer-motion';

export default function StepByStep({ steps }: { steps: string[] }) {
  return (
    <ul className="relative py-2 space-y-6">
      {steps.map((step, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06, ease: 'easeOut' }}
          className="stepper-step flex gap-4"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] text-xs font-bold flex items-center justify-center relative z-10 border border-[#00d4ff]/20 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
            {index + 1}
          </div>
          <p className="text-sm text-[#aaaacc] leading-relaxed pt-1">
            {step}
          </p>
        </motion.li>
      ))}
    </ul>
  );
}
