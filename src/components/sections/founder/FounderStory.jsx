import { motion } from 'framer-motion';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';
import founderPhoto from '../../../assets/founder/fred-omondi.png';

const container = staggerContainer(0.1, 0.1);

export default function FounderStory() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-16"
        >
          <motion.div variants={fadeUpItem} className="lg:sticky lg:top-32 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900 to-navy-700 p-10 shadow-premium-lg">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(212,160,23,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.3) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
                aria-hidden="true"
              />

              <div className="relative flex flex-col items-center text-center">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-gold-500/30" aria-hidden="true" />
                  <div className="absolute -inset-3 rounded-full border border-gold-500/15" aria-hidden="true" />
                  <img
                    src={founderPhoto}
                    alt="Fred Omondi, Founder & CEO of InnoSpeak Global"
                    className="h-24 w-24 rounded-full object-cover shadow-gold"
                  />
                </div>

                <p className="mt-6 font-display text-lg font-bold text-white">Fred Omondi</p>
                <p className="mt-1 font-body text-xs uppercase tracking-wider text-gold-400">
                  Founder &amp; CEO
                </p>
                <p className="mt-1 font-body text-xs text-white/50">InnoSpeak Global</p>
              </div>
            </div>
          </motion.div>

          <div>
            <motion.p variants={fadeUpItem} className="font-body text-base leading-8 text-navy-600 md:text-lg">
              For Fred Omondi, innovation has never been about technology alone—it has always been
              about people. His journey is built on a simple yet powerful belief: that education,
              innovation, and purposeful leadership can transform individuals, strengthen communities,
              and shape a better future.
            </motion.p>

            <motion.p variants={fadeUpItem} className="mt-6 font-body text-base leading-8 text-navy-600 md:text-lg">
              Fred's academic foundation began at Kiambu Institute of Science and Technology (KIST),
              where he graduated with a Diploma in Electrical and Electronics Engineering (Power
              Option). During his time at KIST, he developed a passion for practical engineering,
              problem-solving, and designing solutions that address real-world challenges. His
              academic experience also nurtured an entrepreneurial mindset and a desire to turn
              innovative ideas into meaningful impact.
            </motion.p>

            <motion.p variants={fadeUpItem} className="mt-6 font-body text-base leading-8 text-navy-600 md:text-lg">
              Recognizing that technical expertise alone is not enough to inspire change, Fred
              continued his professional journey by enrolling at the Kenya School of Technical and
              Vocational Education and Training (Kenya School of TVET) to pursue a Diploma in
              Technical Trainer Education (DTTE) in Electrical and Electronics Engineering. This
              advanced training strengthened his ability to combine technical excellence with modern
              teaching methodologies, leadership, and learner-centered education.
            </motion.p>

            <motion.p variants={fadeUpItem} className="mt-6 font-body text-base leading-8 text-navy-600 md:text-lg">
              Alongside his engineering background, Fred discovered a deep passion for mentoring and
              education. Through teaching and working with learners from diverse backgrounds, he
              witnessed firsthand how quality education can restore confidence, unlock potential, and
              create opportunities that extend far beyond the classroom. These experiences convinced
              him that sustainable development begins with empowering people through knowledge,
              skills, and innovation.
            </motion.p>

            <motion.blockquote
              variants={fadeUpItem}
              className="mt-10 border-l-4 border-gold-500 bg-gold-500/5 py-5 pl-6 pr-4"
            >
              <p className="font-display text-xl font-bold italic leading-snug text-navy-900 md:text-2xl">
                This vision became the inspiration behind InnoSpeak Global.
              </p>
            </motion.blockquote>

            <motion.p variants={fadeUpItem} className="mt-10 font-body text-base leading-8 text-navy-600 md:text-lg">
              Founded with the ambition of becoming a world-class center for education, innovation,
              entrepreneurship, and professional development, InnoSpeak Global exists to bridge the
              gap between learning and real-world impact. The institution equips students,
              professionals, entrepreneurs, and organizations with practical knowledge, future-ready
              skills, and the confidence to transform ideas into sustainable solutions.
            </motion.p>

            <motion.p variants={fadeUpItem} className="mt-6 font-body text-base leading-8 text-navy-600 md:text-lg">
              As Founder and Chief Executive Officer, Fred leads with a philosophy that education
              should not merely prepare people for employment—it should prepare them to become
              innovators, ethical leaders, entrepreneurs, and lifelong learners capable of solving
              society's greatest challenges.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}