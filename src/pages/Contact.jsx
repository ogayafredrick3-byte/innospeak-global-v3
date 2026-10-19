
import Seo from '../components/ui/Seo.jsx';
import ContactHero from '../components/sections/contact/ContactHero';
import ContactMain from '../components/sections/contact/ContactMain';

export default function Contact() {
  return (
    <>
      <Seo title="Contact" path="/contact" />
      <ContactHero />
      <ContactMain />
    </>
  );
}