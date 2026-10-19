import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * CheckboxField — premium agreement checkbox.
 *
 * Designed for the final admissions declaration step.
 */

const CheckboxField = forwardRef(function CheckboxField(
  {
    label,
    name,
    checked,
    onChange,
    onBlur,
    error,
    required = false,
    className = '',
    ...props
  },
  ref
) {

  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;


  return (

    <div className={className}>

      <label
        htmlFor={fieldId}
        className={`
          flex
          cursor-pointer
          items-start
          gap-4
          rounded-2xl
          border
          p-5
          transition-all
          duration-300

          ${
            checked
              ? 'border-gold-500 bg-gold-500/10 shadow-lg'
              : 'border-navy-100 bg-white hover:border-gold-500/50'
          }
        `}
      >

        <input
          ref={ref}
          id={fieldId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className="sr-only"
          {...props}
        />


        <motion.div

          animate={{
            scale: checked ? 1 : 0.95,
          }}

          className={`
            flex
            h-6
            w-6
            flex-shrink-0
            items-center
            justify-center
            rounded-lg
            border-2
            transition-all
            duration-300

            ${
              checked
                ? 'border-gold-500 bg-gold-500 text-navy-900'
                : 'border-navy-200 bg-white'
            }
          `}
        >

          {checked && (
            <Check size={16}/>
          )}

        </motion.div>


        <div>

          <p className="text-sm font-semibold leading-relaxed text-navy-900">
            {label}

            {required && (
              <span className="ml-1 text-gold-500">
                *
              </span>
            )}

          </p>


          <p className="mt-2 text-xs leading-relaxed text-navy-400">
            By submitting this application, you confirm that all information provided is accurate and complete.
          </p>


        </div>


      </label>


      {error && (

        <p
          id={errorId}
          className="mt-3 text-xs font-semibold text-red-500"
        >
          {error}
        </p>

      )}

    </div>

  );
});


export default CheckboxField;