import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import { 
  Upload as UploadIcon, 
  Mic, 
  Square, 
  AlertTriangle, 
  ShieldCheck, 
  FileAudio,
  Trash2,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const Upload = () => {
  const { toastSuccess, toastError, toastWarning, toastInfo } = useToast();
  const navigate = useNavigate();

  // Mode: 'upload' or 'record'
  const [mode, setMode] = useState('upload');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(0);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  // Global form states
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 1. FILE UPLOAD HANDLERS
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastError('File size exceeds the 10MB limit.');
      return;
    }

    // Check duration using HTML5 Audio
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      setFileDuration(dur);
      if (dur < 30 || dur > 45) {
        toastWarning(`Selected audio length is ${Math.round(dur)} seconds. Speech must be strictly between 30 and 45 seconds.`);
      } else {
        setSelectedFile(file);
        toastSuccess('Audio file validated. Perfect length!');
      }
    });
    audio.addEventListener('error', () => {
      toastError('Could not read audio file. Make sure it is a valid wav, mp3, ogg, or m4a file.');
    });
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 2. LIVE RECORDER HANDLERS
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop()); // Stop microphone capture streams
      };

      recorder.start();
      setIsRecording(true);

      // Start duration counter timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          // Programmatically auto-stop at 45 seconds max
          if (prev >= 45) {
            stopRecording();
            toastInfo('Recording stopped automatically at the maximum 45-second limit.');
            return 45;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Microphone capture error:', err);
      toastError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingSeconds(0);
  };

  // 3. API PIPELINE TRIGGER
  const handleAnalyze = async () => {
    // DPDP consent double check
    if (!dpdpConsent) {
      toastError('You must review and check the DPDP compliance consent statement.');
      return;
    }

    let fileToUpload = null;
    let durationSec = 0;

    if (mode === 'upload') {
      if (!selectedFile) {
        toastError('Please upload an audio file first.');
        return;
      }
      if (fileDuration < 30 || fileDuration > 45) {
        toastError(`Speech must be strictly between 30 and 45s (current: ${Math.round(fileDuration)}s).`);
        return;
      }
      fileToUpload = selectedFile;
      durationSec = fileDuration;
    } else {
      if (!audioBlob) {
        toastError('Please record your speech first.');
        return;
      }
      if (recordingSeconds < 30 || recordingSeconds > 45) {
        toastError(`Speech must be strictly between 30 and 45s (current: ${recordingSeconds}s).`);
        return;
      }
      // Wrap blob in File structure
      fileToUpload = new File([audioBlob], 'live-recording.webm', { type: 'audio/webm' });
      durationSec = recordingSeconds;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisStep('Uploading audio file to server...');

      const formData = new FormData();
      formData.append('audio', fileToUpload);
      formData.append('dpdpConsent', 'true');
      formData.append('duration', durationSec.toString());

      // Step updates during process duration
      setTimeout(() => setAnalysisStep('AI transcribing speech content (Whisper API)...'), 2000);
      setTimeout(() => setAnalysisStep('Linguistic coach checking syllable stress (GPT-4)...'), 5000);
      setTimeout(() => setAnalysisStep('Compiling final report results...'), 8500);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const reportId = response.data?.report?._id;

      if (!reportId) {
        toastError('Analysis completed, but the report could not be opened.');
        setIsAnalyzing(false);
        return;
      }

      toastSuccess('Analysis complete! Redirecting...');
      navigate(`/reports/${reportId}`);

    } catch (error) {
      console.error('Analysis submission failure:', error);
      const errMsg = error.response?.data?.message || 'Linguistic processing failed. Check file clarity and try again.';
      toastError(errMsg);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Assess Pronunciation</h1>
        <p className="text-sm text-slate-500">Provide a 30 to 45 seconds English speech sample to analyze phonetic accuracy</p>
      </div>

      {isAnalyzing ? (
        /* ANALYSIS SKELETON LOADER */
        <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/35"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary-600">
              <Mic size={24} className="animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Assessment Pipeline Running</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-bold animate-pulse-subtle">
              {analysisStep}
            </p>
          </div>
          <div className="max-w-md text-xs text-slate-400 leading-relaxed">
            Please keep this tab active. Your audio clip is transcribed, matched for phonetic correctness, and unlinked from the server files immediately upon compilation.
          </div>
        </div>
      ) : (
        /* INPUT PANEL */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main upload options */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mode selection toggles */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-dark-900 p-1 border border-slate-200/50 dark:border-dark-800/50">
              <button
                onClick={() => { setMode('upload'); clearRecording(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all ${
                  mode === 'upload'
                    ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <UploadIcon size={16} />
                <span>Upload Audio File</span>
              </button>
              <button
                onClick={() => { setMode('record'); clearSelectedFile(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all ${
                  mode === 'record'
                    ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Mic size={16} />
                <span>Record Voice Live</span>
              </button>
            </div>

            {/* UPLOAD FILE CONTAINER */}
            {mode === 'upload' && (
              <div className="glass-card p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-dark-700 flex flex-col items-center justify-center text-center">
                {!selectedFile ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                      <UploadIcon size={28} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">Drag & Drop Audio</h3>
                    <p className="text-xs text-slate-500 mb-6">wav, mp3, ogg, or m4a. Size up to 10MB.</p>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".wav,.mp3,.ogg,.m4a,audio/*"
                      className="hidden"
                      id="audio-file-input"
                    />
                    <label
                      htmlFor="audio-file-input"
                      className="btn-secondary text-sm cursor-pointer shadow-sm"
                    >
                      Browse Files
                    </label>
                  </>
                ) : (
                  <div className="w-full space-y-5">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900/60 rounded-2xl border border-slate-200/50 dark:border-dark-800/40">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileAudio size={20} />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{selectedFile.name}</p>
                          <span className="text-xs text-slate-500">Duration: {Math.round(fileDuration)} seconds</span>
                        </div>
                      </div>
                      <button
                        onClick={clearSelectedFile}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Audio duration warning */}
                    {(fileDuration < 30 || fileDuration > 45) && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>Speech duration is {Math.round(fileDuration)}s. Audio must be <strong>between 30 and 45 seconds</strong>. Please upload another file.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RECORD VOICE CONTAINER */}
            {mode === 'record' && (
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
                {!audioBlob ? (
                  <>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md relative transition-all ${
                      isRecording 
                        ? 'bg-rose-600 text-white animate-pulse-subtle scale-105' 
                        : 'bg-primary-100 dark:bg-primary-950/30 text-primary-600'
                    }`}>
                      {isRecording ? <Square size={24} /> : <Mic size={28} />}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">
                        {isRecording ? 'Recording Live Audio...' : 'Record Your Speech'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRecording ? 'Speak clearly into your microphone.' : 'Press record and read a paragraph in English.'}
                      </p>
                    </div>

                    {/* Timer Visual */}
                    <div className="text-4xl font-extrabold text-slate-800 dark:text-white font-mono bg-slate-100 dark:bg-dark-900 px-6 py-2.5 rounded-2xl border border-slate-200/40 dark:border-dark-800/40 inline-block">
                      00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                    </div>

                    <div className="flex gap-4">
                      {isRecording ? (
                        <button
                          onClick={stopRecording}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                          <Square size={16} />
                          <span>Stop Recording</span>
                        </button>
                      ) : (
                        <button
                          onClick={startRecording}
                          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                          <Mic size={16} />
                          <span>Start Recording</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full space-y-5">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900/60 rounded-2xl border border-slate-200/50 dark:border-dark-800/40">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle size={20} />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-bold text-sm text-slate-800 dark:text-white">Live Audio Capture</p>
                          <span className="text-xs text-slate-500">Duration: {recordingSeconds} seconds</span>
                        </div>
                      </div>
                      <button
                        onClick={clearRecording}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Audio Player Preview */}
                    <div className="p-3 bg-slate-100 dark:bg-dark-900/60 rounded-2xl border border-slate-200/20">
                      <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                    </div>

                    {/* Recording warnings */}
                    {recordingSeconds < 30 && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>Speech duration is only {recordingSeconds}s. Your recording must be <strong>at least 30 seconds</strong> to perform the assessment. Please clear and record again.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDE COMPLIANCE & TRIGGER PANEL */}
          <div className="space-y-6">
            
            {/* DPDP Consent Form Card */}
            <div className="glass-card p-6 rounded-3xl flex flex-col text-left space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-dark-800/40 pb-3">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Privacy Consent</h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                In compliance with India's <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>:
              </p>

              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Audio samples are analyzed in transient memories and <strong>immediately unlinked and deleted</strong> after transcription completes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Your transcripts and score breakdowns are encrypted at rest.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>You retain absolute rights to delete assessment reports at any time.</span>
                </li>
              </ul>

              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-dark-900/40 rounded-xl border border-slate-200/50 dark:border-dark-850 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-350 dark:border-dark-700 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  I consent to the transient processing of my voice sample for accent evaluation.
                </span>
              </label>
            </div>

            {/* Run button */}
            <button
              onClick={handleAnalyze}
              disabled={
                !dpdpConsent ||
                (mode === 'upload' && (!selectedFile || fileDuration < 30 || fileDuration > 45)) ||
                (mode === 'record' && (!audioBlob || recordingSeconds < 30 || recordingSeconds > 45))
              }
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed text-base font-extrabold shadow-neon"
            >
              <Sparkles size={18} className="animate-spin-slow" />
              <span>Start AI Pronunciation Analysis</span>
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default Upload;
