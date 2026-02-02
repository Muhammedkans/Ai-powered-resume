import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowRight, CheckCircle, MessageSquare, Loader2,
  Upload, Cloud, AlertCircle, Linkedin, Briefcase, Sparkles, Copy, Wand2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobMatcher } from '../components/JobMatcher';
import { analyzeResume, startResumeRefinement } from '../services/api';

export const Dashboard = () => {
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert("Please upload a professional PDF resume.");
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeResume(file);
      setResumeData(data);
      localStorage.setItem('lastExtractedText', data.extractedText);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to analyze resume. Check your Gemini API Key in server/.env or try another PDF.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoImprove = async () => {
    if (!resumeData?.extractedText) return;
    setRefining(true);
    try {
      const data = await startResumeRefinement(resumeData.extractedText);
      setResumeData((prev: any) => ({
        ...prev,
        analysis: data.analysis || data
      }));
    } catch (error) {
      console.error(error);
      alert("AI Refinement failed. Please try again later.");
    } finally {
      setRefining(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add toast notification here
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent underline decoration-cyan-500 underline-offset-8">DASHBOARD</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Welcome back, Architect. Ready to optimize?</p>
          </div>
          <div className="flex gap-4">
            <Link to="/mock-interview" className="px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all group">
              <MessageSquare className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Mock Interview
            </Link>
            <Link to="/builder" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95">
              <ArrowRight className="w-4 h-4" /> Resume Builder
            </Link>
          </div>
        </header>

        {!resumeData && !loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer group overflow-hidden ${isDragging ? 'border-cyan-500 bg-cyan-500/5 scale-[0.99]' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'}`}
              >
                <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept=".pdf" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div animate={isDragging ? { y: -10 } : { y: 0 }} className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors shadow-2xl">
                  <Upload className="w-10 h-10" />
                </motion.div>
                <h2 className="text-3xl font-black mb-3 italic tracking-tight">DROP YOUR ARCHITECTURE</h2>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">Upload your CV/Resume in PDF format to begin the deep-scan optimization protocol.</p>
                <div className="flex justify-center gap-3">
                  <div className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">PDF ONLY</div>
                  <div className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">MAX 5MB</div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-purple-500/40 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/5">
                    <Cloud className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Cloud Optimization</h3>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">Our AI models analyze thousands of data points to ensure your resume bypasses modern ATS filters.</p>
                  <Link to="/builder" className="text-purple-400 text-sm font-black flex items-center gap-2 group-hover:gap-3 transition-all">
                    Start Building <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-emerald-500/40 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/5">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Career Tracker</h3>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">Track your job applications, interviews, and offers in a professional Kanban board.</p>
                  <Link to="/tracker" className="text-emerald-400 text-sm font-black flex items-center gap-2 group-hover:gap-3 transition-all">
                    Open Pipeline <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-cyan-500 mb-6">Execution Tips</h3>
                <ul className="space-y-6">
                  {[
                    { tip: 'Quantify your impact (e.g., "Grew revenue by 20%")', icon: <CheckCircle className="w-4 h-4 text-cyan-500" /> },
                    { tip: 'Use industry-standard action verbs', icon: <CheckCircle className="w-4 h-4 text-cyan-500" /> },
                    { tip: 'Tailor your summary for every role', icon: <CheckCircle className="w-4 h-4 text-cyan-500" /> },
                    { tip: 'Highlight your modern tech stack', icon: <CheckCircle className="w-4 h-4 text-cyan-500" /> }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 text-slate-400 text-sm leading-snug">
                      <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                      <span className="font-medium">{item.tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-[2.5rem] text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  Enterprise Mode
                </div>
                <h4 className="text-sm font-bold text-slate-300 mb-4">Upgrade to Priority AI processing for faster results.</h4>
                <button className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed border border-slate-700">Coming Soon</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border border-slate-800">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mb-8" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
                </div>
                <p className="text-2xl font-black animate-pulse bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic text-center">DECONSTRUCTING EXPERIENCE...</p>
                <p className="text-slate-500 text-sm mt-2 font-medium">Gemini is analyzing structure, keywords, and relevance.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Analysis Header */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                      <div className="relative w-40 h-40 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                          <motion.circle
                            cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="10"
                            strokeDasharray="282.7" initial={{ strokeDashoffset: 282.7 }}
                            animate={{ strokeDashoffset: 282.7 - (resumeData.analysis.score * 2.827) }}
                            transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-black text-5xl leading-none">{resumeData.analysis.score}</span>
                          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1">ATS Score</span>
                        </div>
                      </div>

                      <div className="text-center md:text-left">
                        <h2 className="text-4xl font-black mb-3">Overall Profile Strength</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                          Your resume is performing better than <span className="text-cyan-400">{resumeData.analysis.percentile || 82}%</span> of candidates in the tech industry.
                          <br /><br />
                          <span className="text-purple-400 font-bold">🚀 Elite Strategy:</span> {resumeData.analysis.eliteActionPlan || "Focus on the improvements to reach the elite 1% tier."}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                          <button onClick={() => setResumeData(null)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 transition-colors">Re-analyze Resume</button>
                          <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                            <CheckCircle className="w-4 h-4" /> Ready for Applications
                          </div>
                        </div>

                        {/* AUTO-REFINE BUTTON */}
                        <div className="mt-6">
                          <button
                            disabled={refining}
                            onClick={handleAutoImprove}
                            className="px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group w-fit mx-auto md:mx-0"
                          >
                            {refining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                            {refining ? "Architecting Excellence..." : "Auto-Improve My Resume (AI)"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* AI MASTERPIECE SECTION */}
                    {resumeData.analysis.rebuiltContent && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-700/50 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                            <Wand2 className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black italic tracking-tighter">AI ELITE REBUILD</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">The Google-Tier Transformation</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Rewritten Experience
                            </h4>
                            <div className="space-y-4">
                              {resumeData.analysis.rebuiltContent.experiencePoints?.map((point: string, i: number) => (
                                <div key={i} className="group relative bg-white/[0.02] border border-white/5 hover:border-purple-500/30 p-5 rounded-2xl transition-all">
                                  <p className="text-slate-300 text-sm font-medium leading-relaxed pr-8">{point}</p>
                                  <button onClick={() => copyToClipboard(point)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Optimized Skills Stack
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {resumeData.analysis.rebuiltContent.skillsSection?.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="mt-8 p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl">
                              <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2">Architect's Insight</p>
                              <p className="text-slate-400 text-sm italic font-medium leading-relaxed">"These keyword clusters are designed to hit high-priority neural matchers in top-tier ATS systems like Workday and Greenhouse."</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-green-500/5 border border-green-500/10 p-8 rounded-[2.5rem]">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-green-500 mb-6 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Competitive Strengths
                        </h3>
                        <ul className="space-y-4">
                          {resumeData.analysis.strengths?.map((skill: string, i: number) => (
                            <li key={i} className="flex gap-4 text-slate-300 text-sm font-semibold">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> {skill}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-[2.5rem]">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-amber-500 mb-6 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Growth Areas
                        </h3>
                        <ul className="space-y-4">
                          {resumeData.analysis.improvements?.map((tip: string, i: number) => (
                            <li key={i} className="flex gap-4 text-slate-300 text-sm font-semibold">
                              <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" /> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <JobMatcher resumeText={resumeData.extractedText} />
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-10 rounded-[3rem] relative overflow-hidden group">
                      <MessageSquare className="w-12 h-12 text-purple-400 mb-6" />
                      <h3 className="text-2xl font-black mb-3">AI Mock Interview</h3>
                      <p className="text-slate-300 text-sm mb-8 leading-relaxed font-medium">Ready to prove your skills? Launch a technical simulation based on your profile.</p>
                      <Link to="/mock-interview" className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all">
                        Launch Simulator
                      </Link>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Raw Extraction</h4>
                      <pre className="text-[10px] text-slate-600 font-mono max-h-[150px] overflow-auto whitespace-pre-wrap leading-relaxed">
                        {resumeData.extractedText}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
