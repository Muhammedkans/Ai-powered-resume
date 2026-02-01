import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Loader2, Search, CheckCircle, AlertCircle, Copy, Sparkles } from 'lucide-react';
import { matchJob, generateCoverLetter } from '../services/api';

interface JobMatcherProps {
  resumeText: string;
}

export const JobMatcher = ({ resumeText }: JobMatcherProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);

  const handleMatch = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setMatchResult(null);
    setCoverLetter('');
    try {
      const result = await matchJob(resumeText, jobDescription);
      setMatchResult(result.analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    setGeneratingCL(true);
    try {
      const result = await generateCoverLetter(resumeText, jobDescription);
      setCoverLetter(result.coverLetter);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingCL(false);
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

              {/* Heatmap Visualization */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Keyword Coverage Map</h3>
                  <span className="text-xs font-bold text-slate-400">
                    {matchResult.matchingSkills.length} / {matchResult.matchingSkills.length + matchResult.missingSkills.length} Keywords Found
                  </span>
                </div>

                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-wrap gap-2 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_right_1px] [background-size:16px_16px] pointer-events-none" />

                  {/* Found Keywords (Green) */}
                  {matchResult.matchingSkills.map((skill: string, i: number) => (
                    <motion.div
                      key={`match-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:scale-105 transition-transform cursor-help"
                      title="Found in your resume"
                    >
                      <CheckCircle className="w-3 h-3" /> {skill}
                    </motion.div>
                  ))}

                  {/* Missing Keywords (Red) */}
                  {matchResult.missingSkills.map((skill: string, i: number) => (
                    <motion.div
                      key={`missing-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (matchResult.matchingSkills.length * 0.05) + (i * 0.05) }}
                      className="px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:scale-105 transition-transform cursor-alert animate-pulse"
                      title="Missing from your resume - ADD THIS!"
                    >
                      <AlertCircle className="w-3 h-3" /> {skill}
                    </motion.div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 text-right italic">* Add red keywords to your resume to increase match score.</p>
              </div>

              {/* Heatmap Visualization */}
              <div className="mb-8">
                {/* ... existing code ... */}
              </div>

              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
                  <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Strategic Advice
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic text-justify">"{matchResult.advice}"</p>
                </div>

                {!coverLetter ? (
                  <button
                    onClick={handleCoverLetter}
                    disabled={generatingCL}
                    className="w-full py-4 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all group"
                  >
                    {generatingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                    {generatingCL ? 'AI is composing...' : 'Generate Personalized Cover Letter'}
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative">
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">AI Generated Cover Letter</h4>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">{coverLetter}</pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(coverLetter)}
                      className="mt-6 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-3 h-3" /> Copy to Clipboard
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
