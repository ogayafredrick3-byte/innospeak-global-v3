import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  Home,
  BookOpen,
  Mail,
  Clock,
  Users
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { staggerContainer, fadeUpItem } from '../../lib/motion/presets';


const container = staggerContainer(0.12, 0.1);


export default function ApplicationSuccess({
  application,
  applicationNumber,
  onDownload
}) {


  const fullName =
    [
      application.firstName,
      application.middleName,
      application.lastName
    ]
    .filter(Boolean)
    .join(' ');



  return (

    <motion.section

      variants={container}
      initial="hidden"
      animate="visible"

      className="
        relative
        overflow-hidden
        bg-gradient-to-b
        from-cream
        via-white
        to-cream
        py-32
      "

    >


      <div className="
        pointer-events-none
        absolute
        -left-40
        top-20
        h-96
        w-96
        rounded-full
        bg-gold-500/10
        blur-3xl
      "/>


      <div className="container-premium relative">


        <div className="mx-auto max-w-6xl">


          {/* Heading */}

          <motion.div
            variants={fadeUpItem}
            className="text-center"
          >

            <span className="eyebrow">
              Application Received
            </span>


            <motion.h1
  variants={fadeUpItem}
  className="
    mt-6
    font-display
    text-4xl
    font-bold
    leading-tight
    text-navy-900
    sm:text-5xl
    lg:text-6xl
  "
>
  Welcome to the InnoSpeak journey,
  <span className="block text-gradient-gold">
    {fullName || 'future learner'}.
  </span>
</motion.h1>


<motion.p
  variants={fadeUpItem}
  className="
    mx-auto
    mt-6
    max-w-xl
    font-body
    text-base
    leading-relaxed
    text-navy-600
    md:text-lg
  "
>
  Your application has been received successfully.
  Our admissions team is reviewing your details and will contact you
  with the next steps towards joining InnoSpeak Global Academy.
</motion.p>


          </motion.div>



          {/* Main grid */}

          <div
            className="
              mt-12
              grid
              gap-8
              lg:grid-cols-2
            "
          >



            {/* Next Steps */}

            <motion.div

              variants={fadeUpItem}

              className="
                rounded-3xl
                border
                border-navy-100
                bg-white
                p-8
                shadow-premium
              "

            >

              <h2
                className="
                  font-display
                  text-xl
                  font-bold
                  text-navy-900
                "
              >
                What happens next?
              </h2>


              <div className="mt-8 space-y-6">


                <Step
                  icon={<Clock size={20}/>}
                  title="Application Review"
                  text="Our admissions team reviews your submitted information."
                />


                <Step
                  icon={<Mail size={20}/>}
                  title="Confirmation Email"
                  text="You will receive updates through your email."
                />


                <Step
                  icon={<Users size={20}/>}
                  title="Admissions Contact"
                  text="Our team will guide you through the next stage."
                />


              </div>


            </motion.div>





            {/* Application Details */}

            <motion.div

              variants={fadeUpItem}

              className="
                rounded-3xl
                border
                border-gold-500/20
                bg-white
                p-8
                shadow-premium
              "

            >


              <div
 className="
 rounded-2xl
 border
 border-gold-500/30
 bg-gradient-to-br
 from-gold-500/10
 to-white
 p-6
 text-center
 shadow-lg
 "
>

                <p
    className="
      font-body
      text-xs
      uppercase
      tracking-widest
      text-gold-700
    "
  >
    Application Number
  </p>


  <p
    className="
      mt-2
      font-mono
      text-xl
      font-bold
      text-navy-900
    "
  >
    {applicationNumber}
  </p>


  <div
    className="
      mt-4
      inline-flex
      items-center
      gap-2
      rounded-full
      bg-green-50
      px-4
      py-2
      font-body
      text-xs
      font-semibold
      text-green-700
    "
  >
    <CheckCircle2 size={14}/>
    Application Successfully Recorded
  </div>


</div>




              <div className="mt-8 space-y-5">

                <Detail
                  label="Division"
                  value={application.division === 'labs' ? 'InnoSpeak Global Labs' : application.division === 'academy' ? 'InnoSpeak Global Academy' : '—'}
                />

                <Detail
                  label="Programme"
                  value={application.programme}
                />


                <Detail
                  label="Course Code"
                  value={application.courseCode}
                />


                <Detail
                  label="Applicant"
                  value={fullName}
                />


                <Detail
                  label="Email"
                  value={application.email}
                />


                <Detail
                  label="Study Mode"
                  value={application.preferredLearningMode}
                />


              </div>


            </motion.div>


          </div>




          {/* Buttons */}

          <motion.div

            variants={fadeUpItem}

            className="
              mt-12
              flex
              flex-wrap
              justify-center
              gap-4
            "

          >


            <Button
              variant="gold"
              size="lg"
              onClick={onDownload}
            >

              <Download size={18}/>
              Download Summary

            </Button>



            <Link
              to="/"
              className="btn-outline"
            >
              <Home size={18}/>
              Return Home
            </Link>



            <Link
              to="/academy"
              className="btn-outline"
            >
              <BookOpen size={18}/>
              View Programmes
            </Link>


          </motion.div>


        </div>


      </div>


    </motion.section>

  );
}





function Step({icon,title,text}){

return (

<div className="flex gap-4">

<div className="
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-gold-500/10
text-gold-600
">
{icon}
</div>

<div>

<h3 className="font-body font-bold text-navy-900">
{title}
</h3>

<p className="mt-1 font-body text-sm text-navy-600">
{text}
</p>

</div>

</div>

);

}





function Detail({label,value}){

return (

<motion.div
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
transition={{duration:0.4}}
>

<p className="font-body text-xs uppercase tracking-wider text-navy-400">
{label}
</p>

<p className="mt-1 font-body font-semibold text-navy-900">
{value || '—'}
</p>

</motion.div>

);

}