import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  HelpCircle, 
  Check,
  ChevronDown,
  Star
} from 'lucide-react';

const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      title: 'State-of-the-art Speech to Text',
      desc: 'Transcribe your audio files with extreme precision using OpenAI Whisper, handling diverse accents and speech speeds.',
      icon: Mic,
    },
    {
      title: 'Deep Grammar & Phonetics Analysis',
      desc: 'Leverage Advanced GPT models to compare your spoken words against standard phonetics, highlighting vowel shifts and dropped endings.',
      icon: Sparkles,
    },
    {
      title: 'Actionable Word-level Advice',
      desc: 'Hover over highlighted mistake words in your transcript to see exact phonetic tips and correction pointers.',
      icon: FileText,
    },
    {
      title: 'DPDP 2023 Compliant Security',
      desc: 'Your voice recordings are processed in real-time, analyzed, and permanently deleted from local files immediately. Your text data is encrypted.',
      icon: ShieldCheck,
    },
    {
      title: 'Historical Performance Tracking',
      desc: 'Monitor your progress over time with interactive Line, Bar, and Radar charts highlighting your accent and clarity improvements.',
      icon: TrendingUp,
    },
  ];

  const faqItems = [
    {
      q: "How does Aura Pronunciation AI evaluate my pronunciation?",
      a: "Our system uses a two-stage AI pipeline. First, your audio recording is transcribed with OpenAI Whisper to capture the spoken text and grammatical alignment. Second, the transcript is evaluated by a GPT-driven linguistic coach that flags vowel and consonant errors, syllable stresses, and rhythm patterns, returning an assessment score out of 100."
    },
    {
      q: "Why is there a 30 to 45 seconds file duration limit?",
      a: "This restriction is based on language assessment best practices. 30–45 seconds provides a scientifically sufficient speech sample size (roughly 60–90 words) to accurately calculate clarity, fluency, and pronunciation without introducing processing delays."
    },
    {
      q: "Are my audio files stored on your servers?",
      a: "Absolutely not. In compliance with the India Digital Personal Data Protection (DPDP) Act 2023, audio files are only stored in temporary folders during the transcription request. Once the evaluation is written to the database, the local audio file is permanently unlinked and deleted from our server directories immediately."
    },
    {
      q: "Can I download my report to share with my tutor?",
      a: "Yes! Every assessment generates a professional, high-fidelity PDF report featuring your overall scores, metrics breakdown, highlighted mistake table, and tips. You can download this at any time from your history panel."
    }
  ];

  const testimonials = [
    {
      name: "Aditya Sharma",
      role: "Software Consultant",
      comment: "Aura Pronunciation AI helped me polish my pronunciation for client demos. The word-level tooltips showing where I drop my consonants are incredible.",
      rating: 5
    },
    {
      name: "Sophia Chen",
      role: "International MBA Student",
      comment: "The radar chart visualizes exactly where I fall short in fluency vs clarity. I went from an overall score of 72 to 91 in six weeks!",
      rating: 5
    }
  ];

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-[800px] right-0 w-[300px] h-[300px] bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        {/* HERO SECTION */}
        <div className="grid md:grid-cols-12 gap-12 items-center mb-24">
          <div className="md:col-span-7 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-xs tracking-wide">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>PREMIUM AI ACCENT ASSESSMENT</span>
            </div>
            <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-slate-900 dark:text-white">
              Speak English with{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                Confidence & Clarity
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
              Upload a 30-45s audio sample of your voice. Get instant overall scores, fluency progress trackers, word-by-word accent feedback, and PDF exports.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link
                to="/signup"
                className="btn-primary flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                <span>Assess Your Voice Now</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/compliance"
                className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>DPDP 2023 Compliant</span>
              </Link>
            </div>
          </div>

          {/* Hero Side graphic */}
          <div className="md:col-span-5 flex justify-center animate-float">
            <div className="relative p-8 rounded-3xl bg-white/70 dark:bg-dark-900/70 border border-slate-200/50 dark:border-dark-800/60 shadow-glass-light dark:shadow-glass-dark max-w-sm w-full backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-500">Live AI Analyzer</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white">
                  <Mic size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">pronunciation_test.mp3</h3>
                  <p className="text-xs text-slate-500">Duration: 38 seconds</p>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Overall Score</span>
                    <span className="text-primary-600 dark:text-primary-400">89%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Fluency</span>
                    <span className="text-accent-500">84%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-500 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>

              {/* Transcript Preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                I want to work on my <span className="bg-rose-100 text-rose-800 px-1 rounded font-bold border border-rose-200/50">development</span> goals.
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Engineered for Fluent Speaking
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              An all-in-one assessment engine mapping linguistic analytics to actionable, visual corrections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={index}
                  className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col gap-4 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/55 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-950 dark:text-white">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="mb-24 text-center">
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Four Easy Steps to Better Accent
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Assessments are processed instantly under standard security protocols.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Record or Upload', desc: 'Capture speech directly or upload m4a, mp3, wav (30-45s).' },
              { step: '02', title: 'Confirm Consent', desc: 'Accept data processing terms matching DPDP guidelines.' },
              { step: '03', title: 'AI Breakdown', desc: 'Whisper transcribes while GPT analyses word accents.' },
              { step: '04', title: 'Fetch PDF', desc: 'View feedback grids and export high-fidelity reports.' }
            ].map((step, idx) => (
              <div key={idx} className="relative glass-card p-6 rounded-2xl flex flex-col gap-3 text-left">
                <span className="text-4xl font-extrabold text-primary-200 dark:text-primary-900/50">{step.step}</span>
                <h3 className="font-bold text-slate-800 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Trusted by Professionals</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((test, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(test.rating)].map((_, r) => <Star key={r} size={16} fill="currentColor" />)}
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">"{test.comment}"</p>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{test.name}</h4>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ ACCORDION */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <HelpCircle size={28} className="text-primary-500" />
              <span>Frequently Asked Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-900/40 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-dark-800/40">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
