import { forwardRef } from 'react';

const SelectField = forwardRef(function SelectField(
  {
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    optional = false,
    placeholder = 'Select...',
    options = [],
    className = '',
    ...props
  },
  ref
) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={fieldId} className="font-body text-sm font-bold tracking-wide text-navy-900">
        {label}
        {required && <span className="ml-1 text-gold-600">*</span>}
        {optional && <span className="ml-2 font-body text-xs font-normal text-navy-400">(optional)</span>}
      </label>

      <div className="group relative">
        <select
          ref={ref}
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`w-full appearance-none rounded-2xl border bg-white px-5 py-4 pr-12 font-body text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gold-500/20 disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400 ${
            error
              ? 'border-red-400 focus:border-red-400'
              : 'border-navy-100 hover:border-gold-300 focus:border-gold-500'
          } ${value ? 'text-navy-900' : 'text-navy-400'}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;

            return (
              <option key={val} value={val} className="text-navy-900">
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gold-600">
          ▾
        </div>
      </div>

      {error && (
        <p id={errorId} className="font-body text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

export default SelectField;