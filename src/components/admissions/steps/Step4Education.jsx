import { TextField, SelectField } from '../../ui';
import StepCard from '../StepCard';

const EDUCATION_LEVELS = [
  'Primary School',
  'Secondary / O Level',
  'A Level / IGCSE',
  'Diploma / Certificate',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate (PhD)',
  'Other',
];

/**
 * Step4Education — educational background.
 */
export default function Step4Education({ data, errors, update }) {
  return (
    <StepCard
      stepNum={4}
      title="Education"
      description="Tell us about your educational background so we can place you in the right programme level."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SelectField
          label="Highest Education Level"
          name="educationLevel"
          value={data.educationLevel}
          onChange={(e) => update({ educationLevel: e.target.value })}
          error={errors.educationLevel}
          required
          placeholder="Select level..."
          options={EDUCATION_LEVELS}
          className="sm:col-span-2"
        />
        <TextField
          label="Institution"
          name="institution"
          value={data.institution}
          onChange={(e) => update({ institution: e.target.value })}
          error={errors.institution}
          required
          placeholder="e.g. University of Nairobi"
        />
        <TextField
          label="Year Completed"
          name="yearCompleted"
          value={data.yearCompleted}
          onChange={(e) => update({ yearCompleted: e.target.value })}
          error={errors.yearCompleted}
          required
          placeholder="e.g. 2024"
        />
        <TextField
          label="Current Occupation"
          name="currentOccupation"
          value={data.currentOccupation}
          onChange={(e) => update({ currentOccupation: e.target.value })}
          optional
          placeholder="e.g. Student, Teacher, Freelancer"
          className="sm:col-span-2"
        />
      </div>
    </StepCard>
  );
}
