import { FileUpload } from '../../ui';
import StepCard from '../StepCard';

export default function Step6Documents({ data, update, draftId }) {
  const docSlots = [
    { key: 'passportPhoto', label: 'Passport Photo', accept: 'image/*' },
    { key: 'academicCertificate', label: 'Academic Certificate', accept: '.pdf,.jpg,.png' },
    { key: 'cv', label: 'CV / Resume', accept: '.pdf,.doc,.docx' },
    { key: 'recommendationLetter', label: 'Recommendation Letter', accept: '.pdf,.doc,.docx' },
    { key: 'nationalIdDoc', label: 'National ID / Passport', accept: '.pdf,.jpg,.png' },
  ];

  return (
    <StepCard
      stepNum={6}
      title="Upload Documents"
      description="All documents are optional at this stage — you can submit them later. Drag & drop or browse to upload."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {docSlots.map((slot) => (
          <FileUpload
            key={slot.key}
            label={slot.label}
            accept={slot.accept}
            optional
            draftId={draftId}
            docKey={slot.key}
            files={data.documents?.[slot.key] || []}
            onFilesChange={(updater) =>
              update({
                documents: {
                  ...data.documents,
                  [slot.key]:
                    typeof updater === 'function'
                      ? updater(data.documents?.[slot.key] || [])
                      : updater,
                },
              })
            }
          />
        ))}
      </div>
    </StepCard>
  );
}