import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const RadioGroup = forwardRef(function RadioGroup(
  {
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    options = [],
    className = '',
  },
  ref
) {

  return (
    <div className={className}>

      <label className="mb-4 block text-sm font-bold tracking-wide text-navy-900">
        {label}

        {required && (
          <span className="ml-1 text-gold-500">
            *
          </span>
        )}
      </label>


      <div
        ref={ref}
        className="grid gap-4 sm:grid-cols-3"
      >

        {options.map((option) => {

          const val =
            typeof option === 'string'
              ? option
              : option.value;

          const lbl =
            typeof option === 'string'
              ? option
              : option.label;


          const active = value === val;


          return (

            <motion.button
              key={val}
              type="button"

              whileTap={{
                scale: 0.96,
              }}

              whileHover={{
                y: -3,
              }}

              onClick={() =>
                onChange({
                  target: {
                    name,
                    value: val,
                  },
                })
              }


              className={`
                relative
                overflow-hidden
                rounded-2xl
                border
                p-5
                text-left
                transition-all
                duration-300

                ${
                  active
                    ? `
                    border-gold-500
                    bg-gold-500/10
                    shadow-xl
                    `
                    :
                    `
                    border-navy-100
                    bg-white
                    hover:border-gold-500/50
                    hover:shadow-md
                    `
                }
              `}
            >


              {/* Selected indicator */}

              {active && (

                <div
                  className="
                    absolute
                    right-3
                    top-3
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-gold-500
                    text-navy-900
                  "
                >

                  <Check size={15}/>

                </div>

              )}



              <div className="text-base font-bold text-navy-900">
                {lbl}
              </div>


              <div className="mt-2 text-xs text-navy-400">
                Select this option
              </div>


            </motion.button>

          );

        })}

      </div>


      {error && (

        <p className="mt-3 text-sm font-semibold text-red-500">
          {error}
        </p>

      )}

    </div>

  );

});


export default RadioGroup;