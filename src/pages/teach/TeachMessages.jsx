import { MessageSquare } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { EmptyState } from '../../components/portal/PortalStates.jsx';

export default function TeachMessages() {
  return (
    <>
      <Seo title="Messages" description="Communicate with your students." path="/teach/messages" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Messages</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Communicate with students enrolled in your courses.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          <EmptyState icon={MessageSquare} title="No messages yet" message="Course discussions and direct messages will appear here once students start engaging." />
        </SectionCard>
      </div>
    </>
  );
}
