import foundationHeroImage from '../../assets/foundation/foundation-3.jpg';
import professionalHeroImage from '../../assets/academy/student-1.jpg';
import { HERO_SLIDES } from '../home/heroData.js';

const BACKGROUND_IMAGES = {
  foundation: foundationHeroImage,
  professional: professionalHeroImage,
  homepage: HERO_SLIDES[0].image,
  learning:
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=85',
};

export default function HeroBackground({ variant = 'foundation' }) {
  return (
    <img
      src={BACKGROUND_IMAGES[variant] || BACKGROUND_IMAGES.foundation}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-25"
    />
  );
}