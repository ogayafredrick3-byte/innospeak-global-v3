import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { CheckboxField, Button } from '../../ui';
import StepCard from '../StepCard';

/**
 * Step7Review — review all entered information before submission.
 *
 * Displays a summary of every section with an Edit button that jumps
 * to the relevant step. Includes the declaration checkbox and the
 * submit button.
 */
function ReviewSection({ title, stepNum, onEdit, fields }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-cream p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepNum)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 transition-colors hover:text-gold-600"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs font-medium uppercase tracking-wider text-navy-400">{label}</dt>
            <dd className="text-sm font-medium text-navy-900">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Step7Review({ data, errors, update, onEdit, onSubmit, isSubmitting }) {
  const allDocFiles = Object.values(data.documents || {}).flat();

  return (
    <StepCard
      stepNum={7}
      title="Review Application"
      description="Please review your information before submitting. Use the Edit buttons to make changes."
    >
      <div className="flex flex-col gap-4">
        <ReviewSection
          title="Programme Selection"
          stepNum={1}
          onEdit={onEdit}
          fields={[
            { label: 'Division', value: data.division === 'labs' ? 'InnoSpeak Global Labs' : data.division === 'academy' ? 'InnoSpeak Global Academy' : '—' },
            { label: 'Academy', value: data.academy },
            { label: 'Pathway', value: data.pathway },
            { label: 'Programme', value: data.programme },
            { label: 'Course Code', value: data.courseCode },
            { label: 'Duration', value: data.duration },
            { label: 'Study Mode', value: data.studyMode },
            { label: 'Fees', value: data.fees },
            { label: 'Intake', value: data.intake },
          ]}
        />
        <ReviewSection
          title="Personal Information"
          stepNum={2}
          onEdit={onEdit}
          fields={[
            { label: 'First Name', value: data.firstName },
            { label: 'Middle Name', value: data.middleName },
            { label: 'Last Name', value: data.lastName },
            { label: 'Gender', value: data.gender },
            { label: 'Date of Birth', value: data.dateOfBirth },
            { label: 'Nationality', value: data.nationality },
            { label: 'Phone', value: data.phoneNumber },
            { label: 'WhatsApp', value: data.whatsappNumber },
            { label: 'Email', value: data.email },
            { label: 'National ID', value: data.nationalId },
          ]}
        />
        <ReviewSection
          title="Address"
          stepNum={3}
          onEdit={onEdit}
          fields={[
            { label: 'Country', value: data.country },
            { label: 'County/State', value: data.countyState },
            { label: 'City', value: data.city },
            { label: 'Postal Address', value: data.postalAddress },
          ]}
        />
        <ReviewSection
          title="Education"
          stepNum={4}
          onEdit={onEdit}
          fields={[
            { label: 'Education Level', value: data.educationLevel },
            { label: 'Institution', value: data.institution },
            { label: 'Year Completed', value: data.yearCompleted },
            { label: 'Current Occupation', value: data.currentOccupation },
          ]}
        />
        <ReviewSection
          title="Learning Preferences"
          stepNum={5}
          onEdit={onEdit}
          fields={[
            { label: 'Preferred Schedule', value: data.preferredSchedule },
            { label: 'Preferred Learning Mode', value: data.preferredLearningMode },
            { label: 'Referral Source', value: data.referralSource },
          ]}
        />
        <ReviewSection
          title="Documents"
          stepNum={6}
          onEdit={onEdit}
          fields={[
            {
              label: 'Uploaded Files',
              value: allDocFiles.length ? `${allDocFiles.length} file(s)` : 'No files uploaded',
            },
          ]}
        />
      </div>

      {/* Declaration */}
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-5">
        <CheckboxField
          label="I confirm that the information provided is true and accurate."
          name="declaration"
          checked={data.declaration}
          onChange={(e) => update({ declaration: e.target.checked })}
          error={errors.declaration}
          required
        />
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-end">
        <Button
          variant="gold"
          size="lg"
          onClick={onSubmit}
          disabled={!data.declaration || isSubmitting}
          withArrow={false}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </StepCard>
  );
}