import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobMatcher } from '../components/JobMatcher';
import { analyzeResume } from '../services/api';

export const Dashboard = () => {
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await analyzeResume(file);
      setResumeData(data);
      localStorage.setItem('lastExtractedText', data.extractedText);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic">DASHBOARD</h1>
          <div className="flex gap-4">
            <Link to="/mock-interview" className="px-6 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full text-sm font-bold flex items-center gap-2 transition-all">
              <MessageSquare className="w-4 h-4" /> Mock Interview
            </Link>
            <Link to="/builder" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20">
              <ArrowRight className="w-4 h-4" /> Resume Builder
            </Link>
          </div>
        </header>

        {!resumeData && !loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">Analyze Your Resume</h2>
                <p className="text-slate-400 mb-6">Upload your PDF resume to get instant AI-driven scoring and insights.</p>
                <input type="file" onChange={handleUpload} className="block w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 file:cursor-pointer mb-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all group">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Mock Interviewer</h3>
                  <p className="text-sm text-slate-400 mb-4">Practice your technical skills with AI-driven simulations based on your resume.</p>
                  <Link to="/mock-interview" className="text-purple-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start Practice <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all group">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Smart Builder</h3>
                  <p className="text-sm text-slate-400 mb-4">Create a world-class resume with real-time AI suggestions and templates.</p>
                  <Link to="/builder" className="text-cyan-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open Builder <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h3 className="font-bold mb-4">Pro Tips</h3>
              <ul className="space-y-4">
                {[
                  'Keep your resume under 2 pages.',
                  'Use action verbs (e.g., Engineered, Led).',
                  'Quantify results (e.g., 30% faster).',
                  'Include modern stack keywords.'
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-slate-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-1" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse font-bold tracking-widest uppercase text-sm">Analyzing Experience...</p>
              </div>
            ) : (
              <>
                {/* Results UI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center gap-8">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke="#06b6d4"
                            strokeWidth="8"
                            strokeDasharray={`${resumeData.analysis.score * 2.8} 280`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-3xl">
                          {resumeData.analysis.score}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Overall ATS Score</h2>
                        <p className="text-slate-400 text-sm">Your resume performed better than 75% of applicants for typical MERN stack roles.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl">
                        <h3 className="font-bold mb-4 text-green-400">Strengths</h3>
                        <ul className="space-y-3">
                          {resumeData.analysis.strengths?.map((skill: string, i: number) => (
                            <li key={i} className="flex gap-3 text-slate-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="font-bold mb-4 text-yellow-500">Suggested Improvements</h3>
                        <ul className="space-y-3">
                          {resumeData.analysis.improvements?.map((tip: string, i: number) => (
                            <li key={i} className="flex gap-3 text-slate-300 text-sm">
                              <ArrowRight className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <JobMatcher resumeText={resumeData.extractedText} />
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 p-8 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                      <MessageSquare className="w-10 h-10 text-purple-400 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Next Step: Mock Interview</h3>
                      <p className="text-slate-400 text-sm mb-6">Your resume looks good! Now practice answering tough questions based on your experience.</p>
                      <Link to="/mock-interview" className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                        Start Mock Session
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
