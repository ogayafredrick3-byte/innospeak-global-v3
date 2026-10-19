import Seo from '../components/ui/Seo.jsx';
import LabsHero from '../components/sections/labs/LabsHero';
import AboutLabs from '../components/sections/labs/AboutLabs';
import LabTracks from '../components/sections/labs/LabTracks';
import LabsCourseCatalogue from '../components/sections/labs/LabsCourseCatalogue';
import MarketableCourses from '../components/sections/MarketableCourses.jsx';
import InnovationProcess from '../components/sections/labs/InnovationProcess';
import BuildToImpact from '../components/sections/labs/BuildToImpact';
import EntrepreneurshipInnovation from '../components/sections/labs/EntrepreneurshipInnovation';
import LabOutcomes from '../components/sections/labs/LabOutcomes';
import LabsFAQ from '../components/sections/labs/LabsFAQ';
import SubmitChallenge from '../components/sections/labs/SubmitChallenge';

export default function Labs() {
  return (
    <>
      <Seo
        title="InnoSpeak Labs — Practical Innovation & Engineering"
        description="Hands-on learning across software, AI, data, cloud, cybersecurity, engineering and creative technology."
        path="/labs"
      />

      {/* 1. Hero — unchanged */}
      <LabsHero />

      {/* 2. About — Academy vs Labs comparison */}
      <AboutLabs />

      {/* 3. Seven tracks with sample courses */}
      <LabTracks />

      {/* 4. Full catalogue grouped by track */}
      <LabsCourseCatalogue />

      {/* 5. High-demand course spotlight (shared component) */}
      <MarketableCourses
        division="labs"
        limit={6}
        title="Featured Labs Courses"
        subtitle="Explore selected courses across AI, cloud, cybersecurity and data. Check each course page for project requirements, tools and current availability."
      />

      {/* 6. How it works — 4-step innovation process */}
      <InnovationProcess />
      <BuildToImpact />

      {/* 7. Entrepreneurship & innovation pillars */}
      <EntrepreneurshipInnovation />

      {/* 8. What you walk away with */}
      <LabOutcomes />

      {/* 9. FAQ */}
      <LabsFAQ />

      {/* 10. Submit a challenge CTA */}
      <SubmitChallenge />
    </>
  );
}