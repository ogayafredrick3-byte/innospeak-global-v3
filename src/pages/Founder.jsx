
import Seo from '../components/ui/Seo.jsx';
import FounderHero from '../components/sections/founder/FounderHero';
import FounderStory from '../components/sections/founder/FounderStory';
import AcademicJourney from '../components/sections/founder/AcademicJourney';
import CoreValues from '../components/sections/founder/CoreValues';
import MissionMoment from '../components/sections/founder/MissionMoment';
import FounderClosingQuote from '../components/sections/founder/FounderClosingQuote';

export default function Founder() {
  return (
    <>
      <Seo title="Founder" path="/founder" />
      <FounderHero />
      <FounderStory />
      <AcademicJourney />
      <CoreValues />
      <MissionMoment />
      <FounderClosingQuote />
    </>
  );
}