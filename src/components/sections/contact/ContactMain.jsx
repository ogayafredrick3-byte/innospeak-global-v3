import SectionHeading from '../../ui/SectionHeading.jsx';
import ContactInfo from './ContactInfo';
import ContactForm from './ContactForm';

export default function ContactMain() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Reach Us"
          title="Multiple Ways to Connect"
          subtitle="Choose whichever channel works best for you, or send us a message directly below."
        />

        <div className="mt-12">
          <ContactInfo />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}