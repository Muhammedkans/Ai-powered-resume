import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Bot, Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { matchJob } from '../services/api';

interface JobMatcherProps {
  resumeText: string;
}

export const JobMatcher = ({ resumeText }: JobMatcherProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      const result = await matchJob(resumeText, jobDescription);
      setMatchResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">JD Matcher</h2>
          <p className="text-sm text-slate-400">Paste a Job Description to check your compatibility.</p>
        </div>
      </div>

      <div className="space-y-6">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste Job Description here..."
          className="w-full h-40 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors resize-none text-sm"
        />

        <button
          onClick={handleMatch}
          disabled={loading || !jobDescription.trim()}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {loading ? 'Analyzing Match...' : 'Check Match Percentage'}
        </button>

        <AnimatePresence>
          {matchResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-8 border-t border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-4xl font-black text-white">{matchResult.matchPercentage}%</div>
                  <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest mt-1">Match Score</div>
                </div>
                <div className="h-16 w-32 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center px-4">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 animate-pulse"
                      style={{ width: `${matchResult.matchPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase mb-3">
                    <CheckCircle className="w-3 h-3" /> Matching Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matchingSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-md text-[10px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-[10px] uppercase mb-3">
                    <AlertCircle className="w-3 h-3" /> Missing Keywords
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md text-[10px] font-bold animate-pulse">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Strategic Advice
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed italic text-justify">"{matchResult.advice}"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
