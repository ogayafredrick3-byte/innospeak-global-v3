import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Seo from '../components/ui/Seo.jsx';
import AcademyHero from '../components/sections/academy/AcademyHero.jsx';
import AboutAcademy from '../components/sections/academy/AboutAcademy.jsx';
import ProgrammeCatalogue from '../components/sections/academy/ProgrammeCatalogue.jsx';
import MarketableCourses from '../components/sections/MarketableCourses.jsx';
import CbeAcademy from '../components/sections/academy/CbeAcademy.jsx';
import TvetComingSoon from '../components/sections/academy/TvetComingSoon.jsx';
import LearningModel from '../components/sections/academy/LearningModel.jsx';
import CourseQualityStandard from '../components/sections/academy/CourseQualityStandard.jsx';
import Certification from '../components/sections/academy/Certification.jsx';
import CareerOpportunities from '../components/sections/academy/CareerOpportunities.jsx';
import WhyStudyWithUs from '../components/sections/academy/WhyStudyWithUs.jsx';
import WhoItIsFor from '../components/sections/academy/WhoItIsFor.jsx';
import FAQ from '../components/sections/academy/FAQ.jsx';
import FinalCTA from '../components/sections/academy/FinalCTA.jsx';

export default function Academy() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const pathway = searchParams.get('pathway');
    const targetId = hash || pathway;

    if (!targetId) return;

    const timer = setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchParams, location.hash]);

  return (
    <>
      <Seo
        title="InnoSpeak Academy"
        description="Develop world-class communication, technical and professional skills through InnoSpeak Academy."
        path="/academy"
      />

      <AcademyHero />
      <AboutAcademy />
      <ProgrammeCatalogue />
      <MarketableCourses
        division="academy"
        limit={6}
        title="Featured Academy Courses"
        subtitle="A curated selection from the Academy catalogue. Confirm prerequisites, delivery mode, fees and current availability on each course page."
      />
      <CbeAcademy />
      <TvetComingSoon />
      <LearningModel />
      <CourseQualityStandard />
      <Certification />
      <CareerOpportunities />
      <WhyStudyWithUs />
      <WhoItIsFor />
      <FAQ />
      <FinalCTA />
    </>
  );
}