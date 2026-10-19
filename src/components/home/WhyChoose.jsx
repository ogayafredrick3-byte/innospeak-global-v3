import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import WhyChooseCard from './WhyChooseCard.jsx';
import Button from '../ui/Button.jsx';
import { WHY_CHOOSE_FEATURES } from './whyChooseData.js';

export default function WhyChoose() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Why Choose InnoSpeak Global"
          subtitle="We combine expert instruction, flexible delivery and a practical approach to create a learning experience that truly transforms."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {WHY_CHOOSE_FEATURES.map((feature, i) => (
            <WhyChooseCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Button to="/about" variant="outline" size="lg" className="group">
            Learn More About Us
            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}