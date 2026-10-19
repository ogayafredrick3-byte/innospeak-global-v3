import Seo from '../components/ui/Seo.jsx';

// ACT 1 — Attention
import AnnouncementBanner from '../components/home/AnnouncementBanner.jsx';
import Hero from '../components/home/Hero.jsx';
import PromotionRail from '../components/home/PromotionRail.jsx';

// ACT 2 — Understanding
import WhyChoose from '../components/home/WhyChoose.jsx';
import Ecosystem from '../components/home/Ecosystem.jsx';

// ACT 3 — Desire
import Pathways from '../components/home/Pathways.jsx';
import CertificatePreview from '../components/home/CertificatePreview.jsx';
import FreeCoursesTeaser from '../components/home/FreeCoursesTeaser.jsx';
import NewCourses from '../components/home/NewCourses.jsx';

// ACT 4 — Clarity
import LearningJourney from '../components/home/LearningJourney.jsx';
import LearningEcosystem from '../components/home/LearningEcosystem.jsx';
import LabsPromotion from '../components/home/LabsPromotion.jsx';

// ACT 5 — Proof
import Impact from '../components/home/Impact.jsx';
import Partners from '../components/home/Partners.jsx';
import Testimonials from '../components/home/Testimonials.jsx';

// ACT 6 — Close
import FAQ from '../components/home/FAQ.jsx';
import ClosingCTA from '../components/home/ClosingCTA.jsx';

export default function Home() {
  return (
    <>
      <Seo
        title="InnoSpeak Global — Learn. Build. Innovate. Make an Impact."
        description="A connected ecosystem of structured learning, practical innovation, and educational support."
        path="/"
      />

      {/* ═══════════════════════════════════════════════════════
          ACT 1 — ATTENTION  (0–5 seconds)
          Grab the visitor and give them clear next steps.
         ═══════════════════════════════════════════════════════ */}
      <div className="pt-20">
        <AnnouncementBanner />
      </div>
      <Hero />
      <PromotionRail />

      {/* ═══════════════════════════════════════════════════════
          ACT 2 — UNDERSTANDING  (5–30 seconds)
          Why choose us + what we offer at a high level.
         ═══════════════════════════════════════════════════════ */}
      <WhyChoose />
      <Ecosystem />

      {/* ═══════════════════════════════════════════════════════
          ACT 3 — DESIRE  (30 sec – 2 min)
          Showcase courses, outcomes and the zero-risk entry point.
          Backgrounds alternate: cream → white → navy → cream
         ═══════════════════════════════════════════════════════ */}
      <Pathways />
      <CertificatePreview />
      <FreeCoursesTeaser />
      <NewCourses />

      {/* ═══════════════════════════════════════════════════════
          ACT 4 — CLARITY  (2–3 min)
          How it works + what's included + the advanced track.
         ═══════════════════════════════════════════════════════ */}
      <LearningJourney />
      <LearningEcosystem />
      <LabsPromotion />

      {/* ═══════════════════════════════════════════════════════
          ACT 5 — PROOF  (3–4 min)
          Numbers, partners and real learner voices.
         ═══════════════════════════════════════════════════════ */}
      <Impact />
      <Partners />
      <Testimonials />

      {/* ═══════════════════════════════════════════════════════
          ACT 6 — CLOSE
          Handle objections, then make the final ask.
         ═══════════════════════════════════════════════════════ */}
      <FAQ />
      <ClosingCTA />
    </>
  );
}