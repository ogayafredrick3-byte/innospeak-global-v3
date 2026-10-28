import Seo from '../components/ui/Seo.jsx';
import FoundationHero from '../components/sections/foundation/FoundationHero.jsx';
import FoundationImpact from '../components/sections/foundation/FoundationImpact.jsx';
import FocusAreas from '../components/sections/foundation/FocusAreas.jsx';
import FoundationInitiatives from '../components/sections/foundation/FoundationInitiatives.jsx';
import UpcomingEvents from '../components/sections/foundation/UpcomingEvents.jsx';
import HowSupportWorks from '../components/sections/foundation/HowSupportWorks.jsx';
import WaysToGive from '../components/sections/foundation/WaysToGive.jsx';
import Transparency from '../components/sections/foundation/Transparency.jsx';
import FoundationStories from '../components/sections/foundation/FoundationStories.jsx';
import FoundationFAQ from '../components/sections/foundation/FoundationFAQ.jsx';
import FoundationClosingCTA from '../components/sections/foundation/FoundationClosingCTA.jsx';

export default function Foundation() {
  return (
    <>
      <Seo
        title="InnoSpeak Global Foundation — Opening Doors to Learning, Skills & Opportunity"
        description="The InnoSpeak Global Foundation removes barriers to education, technology, STEM and community opportunity through scholarships, digital access, Girls in STEM and Community Impact Grants."
        path="/foundation"
      />

      {/* ACT 1 — Attention */}
      <FoundationHero />

      {/* ACT 2 — Proof */}
      <FoundationImpact />

      {/* ACT 3 — Understanding (4 programs) */}
      <FocusAreas />

      {/* ACT 4 — Live initiatives */}
      <FoundationInitiatives />

      {/* ACT 5 — Upcoming events & opportunities */}
      <UpcomingEvents />

      {/* ACT 6 — Process (how support works) */}
      <HowSupportWorks />

      {/* ACT 7 — Ways to give */}
      <WaysToGive />

      {/* ACT 8 — Accountability */}
      <Transparency />

      {/* ACT 9 — Stories from the field */}
      <FoundationStories />

      {/* ACT 10 — Objections */}
      <FoundationFAQ />

      {/* ACT 11 — Close */}
      <FoundationClosingCTA />
    </>
  );
}