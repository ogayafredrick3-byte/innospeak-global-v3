import { useEffect, useState } from 'react';
import { FolderOpen, Download } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getStudentDocuments } from '../../lib/supabase/studentPortal';
import { supabase } from '../../lib/supabase/client';

const DOC_TYPE_LABELS = {
  admission_letter: 'Admission Letter',
  student_id_card: 'Student ID',
  fee_statement: 'Fee Statement',
  result_slip: 'Result Slip',
  transcript: 'Transcript',
  academic_letter: 'Academic Letter',
  certificate: 'Certificate',
};

export default function Documents() {
  const [state, setState] = useState({ loading: true, error: null, documents: [] });

  useEffect(() => {
    getStudentDocuments()
      .then((documents) => setState({ loading: false, error: null, documents }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your documents.', documents: [] }));
  }, []);

  async function handleDownload(doc) {
    if (!doc.file_path || !supabase) return;
    const { data, error } = await supabase.storage.from('student-documents').createSignedUrl(doc.file_path, 60);
    if (!error && data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
  }

  const columns = [
    { key: 'title', label: 'Document', render: (r) => r.title },
    { key: 'doc_type', label: 'Type', render: (r) => DOC_TYPE_LABELS[r.doc_type] || r.doc_type },
    { key: 'issued_at', label: 'Issued', render: (r) => new Date(r.issued_at).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.file_path ? (
          <button
            type="button"
            onClick={() => handleDownload(r)}
            className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
          >
            <Download size={14} />
            Download
          </button>
        ) : (
          <span className="font-body text-xs text-navy-400">Processing</span>
        ),
    },
  ];

  return (
    <>
      <Seo title="Documents" description="Access your official student documents." path="/portal/documents" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Documents</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Your official documents: admission letter, ID, statements, transcripts and certificates.
        </p>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Official Documents"
          description="Need something not listed here? Submit a request under Services / Requests."
        >
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.documents.length === 0 && (
            <EmptyState icon={FolderOpen} title="No documents yet" message="Documents issued to you by the institution will appear here." />
          )}
          {!state.loading && !state.error && state.documents.length > 0 && <DataTable columns={columns} rows={state.documents} />}
        </SectionCard>
      </div>
    </>
  );
}
