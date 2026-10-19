/**
 * motionPresets — shared Framer Motion variants and easing curves.
 *
 * Keeps stagger timing and entrance easing consistent across every
 * section so the homepage and sub-pages share one motion language.
 */
export const easeOutExpo = [0.16, 1, 0.3, 1];

export const staggerContainer = (stagger = 0.12, delay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

export const fadeInItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeOutExpo } },
};

/** Common viewport config for whileInView reveals. */
export const inViewOnce = { once: true, margin: '-80px' };
