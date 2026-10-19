import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Programme' },
  { num: 2, label: 'Personal' },
  { num: 3, label: 'Address' },
  { num: 4, label: 'Education' },
  { num: 5, label: 'Preferences' },
  { num: 6, label: 'Documents' },
  { num: 7, label: 'Review' },
];


export default function Stepper({ current, onStepClick }) {

  const progress =
    ((current - 1) / (STEPS.length - 1)) * 100;


  return (
    <div
      className="
        rounded-3xl
        border
        border-navy-100
        bg-white/80
        p-5
        shadow-lg
        backdrop-blur-md
        md:p-7
      "
    >


      {/* Desktop */}

      <div className="hidden md:block">

        <div className="relative">


          {/* Background line */}

          <div
            className="
              absolute
              left-0
              right-0
              top-5
              h-1
              rounded-full
              bg-navy-100
            "
          />


          {/* Progress line */}

          <motion.div
            className="
              absolute
              left-0
              top-5
              h-1
              rounded-full
              bg-gold-500
            "

            animate={{
              width: `${progress}%`,
            }}

            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}

          />


          <ol className="relative flex justify-between">


            {STEPS.map((step) => {


              const complete = step.num < current;

              const active = step.num === current;

              const clickable =
                step.num <= current && onStepClick;


              return (

                <li
                  key={step.num}
                  className="flex flex-col items-center"
                >


                  <button

                    type="button"

                    disabled={!clickable}

                    onClick={
                      clickable
                        ? () => onStepClick(step.num)
                        : undefined
                    }

                    className="
                      flex
                      flex-col
                      items-center
                      gap-3
                    "
                  >


                    <motion.div

                      animate={{
                        scale: active ? 1.15 : 1,
                      }}

                      className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        text-sm
                        font-bold
                        transition-all

                        ${
                          complete
                            ? 'border-gold-500 bg-gold-500 text-navy-900'
                            :
                          active
                            ? 'border-gold-500 bg-white text-gold-600 ring-8 ring-gold-500/10'
                            :
                            'border-navy-200 bg-white text-navy-400'
                        }
                      `}
                    >

                      {
                        complete
                          ? <Check size={18}/>
                          : step.num
                      }

                    </motion.div>



                    <span

                      className={`
                        text-xs
                        font-semibold
                        transition-colors

                        ${
                          active
                            ? 'text-navy-900'
                            :
                          complete
                            ? 'text-navy-600'
                            :
                            'text-navy-400'
                        }
                      `}
                    >

                      {step.label}

                    </span>


                  </button>


                </li>

              );

            })}


          </ol>

        </div>


      </div>



      {/* Mobile */}

      <div className="md:hidden">


        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs uppercase tracking-wider text-navy-400">
              Application Progress
            </p>

            <p className="mt-1 text-sm font-bold text-navy-900">
              Step {current} of {STEPS.length}
            </p>

          </div>


          <span className="rounded-full bg-gold-500/10 px-4 py-2 text-sm font-bold text-gold-600">

            {STEPS[current - 1]?.label}

          </span>


        </div>



        <div className="mt-5 h-2 overflow-hidden rounded-full bg-navy-100">


          <motion.div

            className="
              h-full
              rounded-full
              bg-gold-500
            "

            animate={{
              width: `${(current / STEPS.length) * 100}%`,
            }}

            transition={{
              duration: 0.4,
            }}

          />


        </div>


      </div>


    </div>
  );
}