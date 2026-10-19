import { forwardRef } from 'react';

/**
 * TextField — premium admissions input field.
 *
 * Keeps the original props while adding:
 * - premium styling
 * - gold focus effect
 * - better spacing
 * - subtle animations
 */
const TextField = forwardRef(function TextField(
  {
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    required = false,
    optional = false,
    placeholder = '',
    autoComplete = 'off',
    className = '',
    ...props
  },
  ref
) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>

      <label
        htmlFor={fieldId}
        className="font-body text-sm font-bold tracking-wide text-navy-900"
      >
        {label}

        {required && (
          <span className="ml-1 text-gold-500">
            *
          </span>
        )}

        {optional && (
          <span className="ml-2 font-body text-xs font-normal text-navy-400">
            (optional)
          </span>
        )}
      </label>


      <div className="group relative">

        <input
          ref={ref}
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}

          className={`
            w-full
            rounded-2xl
            border
            bg-white
            px-5
            py-4
            font-body
            text-sm
            text-navy-900
            shadow-sm
            transition-all
            duration-300

            placeholder:text-navy-400

            focus:outline-none
            focus:ring-4
            focus:ring-gold-500/20

            ${
              error
                ? 'border-red-400 focus:border-red-400'
                : 'border-navy-100 hover:border-gold-500/50 focus:border-gold-500'
            }
          `}
          {...props}
        />


        {/* Focus glow */}
        <div
          className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl
          opacity-0
          ring-1
          ring-gold-500/40
          transition-opacity
          duration-300
          group-focus-within:opacity-100
          "
        />

      </div>


      {error && (
        <p
          id={errorId}
          className="font-body text-xs font-semibold text-red-500"
        >
          {error}
        </p>
      )}

    </div>
  );
});

export default TextField;