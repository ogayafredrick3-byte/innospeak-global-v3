import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { FOUNDATION_STATS } from './foundationData.js';

function StatTile({ stat, index }) {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!inView || stat.value == null) return;
    const duration = 1500;
    const start = performance.now();
    let frameId;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor(stat.value * p));
      if (p < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, stat.value]);

  return (
    <motion.div
      ref={setRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-premium"
    >
      <div className="font-display text-2xl font-bold text-emerald-700 sm:text-3xl">
        {stat.value == null ? 'Not yet reported' : <>{count}<span className="text-gold-500">{stat.suffix}</span></>}
      </div>
      <div className="mt-2 font-body text-[11px] font-bold uppercase tracking-wider text-navy-700">
        {stat.label}
      </div>
      {stat.description && (
        <p className="mt-1 font-body text-xs text-navy-500">{stat.description}</p>
      )}
    </motion.div>
  );
}

export default function FoundationImpact() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Impact at a Glance"
          title="Impact We Can Account For"
          subtitle="We will publish totals when they can be supported by verified programme and financial records. We do not present unverified estimates as impact."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FOUNDATION_STATS.map((stat, i) => (
            <StatTile key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}