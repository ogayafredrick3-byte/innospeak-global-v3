import { TextField, SelectField } from '../../ui';
import StepCard from '../StepCard';

const GENDERS = ['Male', 'Female', 'Prefer not to say'];

/**
 * Step2Personal — personal information collection.
 */
export default function Step2Personal({ data, errors, update }) {
  return (
    <StepCard
      stepNum={2}
      title="Personal Information"
      description="Tell us about yourself so we can personalise your learning experience."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          label="First Name"
          name="firstName"
          value={data.firstName}
          onChange={(e) => update({ firstName: e.target.value })}
          error={errors.firstName}
          required
          autoComplete="given-name"
        />
        <TextField
          label="Middle Name"
          name="middleName"
          value={data.middleName}
          onChange={(e) => update({ middleName: e.target.value })}
          optional
          autoComplete="additional-name"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={data.lastName}
          onChange={(e) => update({ lastName: e.target.value })}
          error={errors.lastName}
          required
          autoComplete="family-name"
        />
        <SelectField
          label="Gender"
          name="gender"
          value={data.gender}
          onChange={(e) => update({ gender: e.target.value })}
          error={errors.gender}
          required
          options={GENDERS}
        />
        <TextField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => update({ dateOfBirth: e.target.value })}
          error={errors.dateOfBirth}
          required
        />
        <TextField
          label="Nationality"
          name="nationality"
          value={data.nationality}
          onChange={(e) => update({ nationality: e.target.value })}
          error={errors.nationality}
          required
          placeholder="e.g. Kenyan"
          autoComplete="country-name"
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={data.phoneNumber}
          onChange={(e) => update({ phoneNumber: e.target.value })}
          error={errors.phoneNumber}
          required
          placeholder="+254 700 000 000"
          autoComplete="tel"
        />
        <TextField
          label="WhatsApp Number"
          name="whatsappNumber"
          type="tel"
          value={data.whatsappNumber}
          onChange={(e) => update({ whatsappNumber: e.target.value })}
          optional
          placeholder="+254 700 000 000"
        />
        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          error={errors.email}
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="sm:col-span-2"
        />
        <TextField
          label="National ID / Passport"
          name="nationalId"
          value={data.nationalId}
          onChange={(e) => update({ nationalId: e.target.value })}
          optional
          placeholder="e.g. 12345678 or passport number"
          className="sm:col-span-2"
        />
      </div>
    </StepCard>
  );
}
