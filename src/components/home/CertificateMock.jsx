import { Award, Sparkles } from 'lucide-react';
import { CERTIFICATE_SAMPLE } from './certificateData.js';

/**
 * CertificateMock — a realistic certificate preview.
 * Pure HTML/CSS so it renders crisply at any size. Uses only the brand
 * palette (navy + gold + cream). No images required.
 */
export default function CertificateMock({ sample = CERTIFICATE_SAMPLE }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Outer glow */}
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gold-500/10 blur-2xl" />

      {/* Outer frame — gold band */}
      <div className="relative rounded-2xl bg-gold-gradient p-1 shadow-premium-lg">
        {/* Inner — navy certificate body */}
        <div className="relative overflow-hidden rounded-[14px] bg-navy-gradient px-7 py-8 sm:px-9 sm:py-10">
          {/* Corner ornaments */}
          <span className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-gold-400/60" />
          <span className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-gold-400/60" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-gold-400/60" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-gold-400/60" />

          {/* Top ornament */}
          <div className="flex justify-center">
            <Sparkles size={20} className="text-gold-400" />
          </div>

          {/* Division line */}
          <p className="mt-3 text-center font-body text-[10px] font-bold uppercase tracking-[0.25em] text-gold-300">
            {sample.division}
          </p>

          {/* Rule */}
          <div className="mx-auto mt-3 h-px w-16 bg-gold-500/60" />

          {/* Heading */}
          <h3 className="mt-6 text-center font-display text-2xl font-bold text-white sm:text-3xl">
            Certificate of Completion
          </h3>

          {/* Rule */}
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

          {/* Certified text */}
          <p className="mt-6 text-center font-body text-[11px] uppercase tracking-wider text-white/60">
            This certifies that
          </p>

          {/* Learner name */}
          <p className="mt-2 text-center font-display text-xl font-semibold italic text-gold-300 sm:text-2xl">
            {sample.learnerName}
          </p>

          {/* Completed text */}
          <p className="mt-4 text-center font-body text-[11px] uppercase tracking-wider text-white/60">
            has successfully completed
          </p>

          {/* Course name */}
          <p className="mt-2 text-center font-display text-lg font-bold text-white sm:text-xl">
            {sample.courseName}
          </p>
          <p className="mt-1 text-center font-mono text-[11px] tracking-wider text-gold-400">
            {sample.courseCode}
          </p>

          {/* Bottom block: date + id + signature */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div className="text-center">
              <p className="font-body text-[9px] uppercase tracking-wider text-white/50">
                Issued
              </p>
              <p className="mt-1 font-body text-[11px] font-semibold text-white">
                {sample.issuedOn}
              </p>
            </div>

            <div className="text-center">
              <p className="font-body text-[9px] uppercase tracking-wider text-white/50">
                Certificate ID
              </p>
              <p className="mt-1 font-mono text-[11px] font-semibold text-gold-300">
                {sample.certificateId}
              </p>
            </div>

            <div className="text-center">
              <p className="font-body text-[9px] uppercase tracking-wider text-white/50">
                Verified
              </p>
              <p className="mt-1 font-body text-[11px] font-semibold text-emerald-400">
                ✓ InnoSpeak
              </p>
            </div>
          </div>

          {/* Signature row */}
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-lg italic text-gold-300">
                {sample.signature}
              </p>
              <div className="mt-1 h-px w-24 bg-white/30" />
              <p className="mt-1 font-body text-[9px] uppercase tracking-wider text-white/50">
                {sample.signatureTitle}
              </p>
            </div>

            {/* Gold seal */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient shadow-gold">
              <Award size={22} className="text-navy-900" strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating "verified" badge */}
      <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 shadow-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
        <span className="font-body text-[10px] font-bold uppercase tracking-wide text-white">
          Verifiable
        </span>
      </div>
    </div>
  );
}