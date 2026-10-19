import { TextField } from '../../ui';
import StepCard from '../StepCard';

/**
 * Step3Address — address information.
 */
export default function Step3Address({ data, errors, update }) {
  return (
    <StepCard
      stepNum={3}
      title="Address"
      description="Where are you based? This helps us plan in-person and hybrid sessions."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          label="Country"
          name="country"
          value={data.country}
          onChange={(e) => update({ country: e.target.value })}
          error={errors.country}
          required
          placeholder="e.g. Kenya"
          autoComplete="country-name"
        />
        <TextField
          label="County / State / Province"
          name="countyState"
          value={data.countyState}
          onChange={(e) => update({ countyState: e.target.value })}
          error={errors.countyState}
          required
          placeholder="e.g. Nairobi County"
        />
        <TextField
          label="City"
          name="city"
          value={data.city}
          onChange={(e) => update({ city: e.target.value })}
          error={errors.city}
          required
          placeholder="e.g. Nairobi"
          autoComplete="address-level2"
        />
        <TextField
          label="Postal Address"
          name="postalAddress"
          value={data.postalAddress}
          onChange={(e) => update({ postalAddress: e.target.value })}
          optional
          placeholder="e.g. P.O. Box 12345-00100"
          autoComplete="postal-code"
        />
      </div>
    </StepCard>
  );
}
