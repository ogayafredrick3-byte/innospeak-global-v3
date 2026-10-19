import Seo from '../components/ui/Seo.jsx';
import AboutHero from '../components/about/AboutHero.jsx';
import OurStory from '../components/about/OurStory.jsx';
import MissionVisionValues from '../components/about/MissionVisionValues.jsx';

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        description="InnoSpeak Global is a forward-thinking education, innovation and leadership platform equipping learners with communication, technical, digital and entrepreneurial skills."
        path="/about"
      />
      <AboutHero />
      <OurStory />
      <MissionVisionValues />
    </>
  );
}
