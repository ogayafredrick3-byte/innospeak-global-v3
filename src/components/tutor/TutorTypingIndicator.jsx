import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * TutorTypingIndicator — three-dot "thinking" indicator matching the
 * bubble layout, shown while awaiting the tutor's reply.
 */
export default function TutorTypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
        <Sparkles size={14} />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-navy-100 bg-white px-4 py-3.5 shadow-premium">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-navy-300"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}