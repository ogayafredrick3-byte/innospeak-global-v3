import { RadioGroup, TextField } from '../../ui';
import StepCard from '../StepCard';

const SCHEDULES = ['Weekday', 'Weekend', 'Evening'];
const LEARNING_MODES = ['Online', 'Physical', 'Hybrid'];

/**
 * Step5Preferences — learning preferences.
 */
export default function Step5Preferences({ data, errors, update }) {
  return (
    <StepCard
      stepNum={5}
      title="Learning Preferences"
      description="Help us schedule your classes to fit your life."
    >
      <div className="flex flex-col gap-6">
        <RadioGroup
          label="Preferred Schedule"
          name="preferredSchedule"
          value={data.preferredSchedule}
          onChange={(e) => update({ preferredSchedule: e.target.value })}
          error={errors.preferredSchedule}
          required
          options={SCHEDULES}
        />
        <RadioGroup
          label="Preferred Learning Mode"
          name="preferredLearningMode"
          value={data.preferredLearningMode}
          onChange={(e) => update({ preferredLearningMode: e.target.value })}
          error={errors.preferredLearningMode}
          required
          options={LEARNING_MODES}
        />
        <TextField
          label="How did you hear about InnoSpeak Global?"
          name="referralSource"
          value={data.referralSource}
          onChange={(e) => update({ referralSource: e.target.value })}
          optional
          placeholder="e.g. Friend, social media, Google, event"
        />
      </div>
    </StepCard>
  );
}
