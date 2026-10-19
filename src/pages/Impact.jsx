
import Seo from '../components/ui/Seo.jsx';
import ImpactHero from '../components/sections/impact/ImpactHero';
import ImpactStats from '../components/sections/impact/ImpactStats';
import ImpactHighlights from '../components/sections/impact/ImpactHighlights';
import ImpactStory from '../components/sections/impact/ImpactStory';
import ImpactCTA from '../components/sections/impact/ImpactCTA';

export default function Impact() {
  return (
    <>
      <Seo title="Impact" path="/impact" />
      <ImpactHero />
      <ImpactStats />
      <ImpactHighlights />
      <ImpactStory />
      <ImpactCTA />
    </>
  );
}