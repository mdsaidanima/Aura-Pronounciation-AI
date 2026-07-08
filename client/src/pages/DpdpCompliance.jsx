import React from 'react';
import { ShieldCheck, FileText, CheckCircle, Clock, Trash2, EyeOff } from 'lucide-react';

const DpdpCompliance = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-8 dark:text-slate-100 transition-colors duration-200">
      
      {/* Page Title */}
      <div className="space-y-4 text-center md:text-left border-b border-slate-200 dark:border-dark-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <ShieldCheck size={14} />
          <span>STATUTORY DATA PRIVACY POLICY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          DPDP 2023 Privacy & Compliance
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
          Aura Pronunciation AI is built from the ground up to satisfy 100% of the mandates under India's Digital Personal Data Protection (DPDP) Act, 2023. We protect your personal credentials and voice analytics.
        </p>
      </div>

      {/* Overview Block */}
      <div className="glass-card p-6 rounded-3xl grid md:grid-cols-3 gap-6 items-center border border-slate-200/40">
        <div className="md:col-span-2 space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Key Consent Notice</h3>
          <p className="text-xs text-slate-550 leading-relaxed">
            By uploading speech audio to our platform, you acknowledge and agree that your data will be processed transiently for the sole purpose of conducting a pronunciation evaluation. You retain the right to erase this data at any point.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
        </div>
      </div>

      {/* CORE COMPLIANCE PRINCIPLES */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Core DPDP Principles Implemented</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Explicit Consent */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-primary-650 dark:text-primary-400">
              <CheckCircle size={18} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Lawful & Consent-Based Processing</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              No audio sample is uploaded or analyzed without explicit user consent. We present a mandatory, clear agreement checkbox prior to each recording or file drop. Users can withdraw consent at any time.
            </p>
          </div>

          {/* 2. Purpose Limitation */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-primary-650 dark:text-primary-400">
              <FileText size={18} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Purpose Limitation</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your voice metrics are processed exclusively to perform speech evaluations, accent coaching, and score progressions. We do not use user voices to train secondary AI models or sell voice data.
            </p>
          </div>

          {/* 3. Data Minimization */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-primary-650 dark:text-primary-400">
              <EyeOff size={18} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Data Minimization</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              We collect only the bare minimum details required to operate: name, email (for login verification), and a 30-45 second voice audio file. No supplementary metadata or device tracking data is recorded.
            </p>
          </div>

          {/* 4. Transient Storage / Zero retention */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-primary-650 dark:text-primary-400">
              <Clock size={18} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Transient Voice Processing</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Uploaded audio files are held in local temporary storage directories only for the duration of the transcription. Immediately upon returning scores, the temporary audio files are permanently deleted.
            </p>
          </div>

          {/* 5. Right to Erasure */}
          <div className="glass-card p-6 rounded-2xl md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-primary-650 dark:text-primary-400">
              <Trash2 size={18} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Right to Erasure & Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every user holds the legal right of absolute data erasure. Deleting an assessment report immediately unlinks and drops the scores and transcript indexes from our databases. If you request account closure, all associated records are permanently scrubbed within 48 business hours.
            </p>
          </div>

        </div>
      </div>

      {/* SECURITY OVERVIEW */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 text-left border border-slate-200/40 bg-white/40 dark:bg-dark-900/40">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Data Residency & Encryption Standards</h3>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Consistent with data fiduciary rules, all text transcripts, profiles, and score progressions are stored in secure cloud database instances featuring AES-256 encryption at rest and TLS 1.3 encryption during transit.
        </p>

        <p className="text-xs text-slate-500 leading-relaxed">
          For questions regarding data processing audits, or to exercise your rights under the DPDP Act 2023, please contact our designated Grievance Officer:
        </p>

        <div className="bg-slate-100 dark:bg-dark-900/80 p-4 rounded-2xl border border-slate-200/40 text-xs font-semibold text-slate-655 dark:text-slate-400 leading-relaxed">
          <p><strong className="text-slate-800 dark:text-white">Grievance & Data Compliance Officer:</strong> Aura Pronunciation AI Compliance Team</p>
          <p className="mt-1"><strong className="text-slate-800 dark:text-white">Email:</strong> privacy@aurapronounce.com</p>
          <p className="mt-1"><strong className="text-slate-800 dark:text-white">Residency:</strong> Servers Hosted in Central India Region, MongoDB Atlas Cloud cluster</p>
        </div>
      </div>

    </div>
  );
};

export default DpdpCompliance;
