import { motion } from 'framer-motion';

export default function DirectoryItems({ config }) {
  const Icon = config.icon;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {config.items.map((item, i) => (
        <motion.article
          key={item}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-premium-lg"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
            <Icon size={20} strokeWidth={1.8} />
          </div>
          <h2 className="mt-5 font-display text-lg font-bold text-navy-900">
            {item}
          </h2>
          <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-500">
            This area is structured for real content and can be populated from the
            relevant programme, event, project or community record.
          </p>
        </motion.article>
      ))}
    </div>
  );
}
