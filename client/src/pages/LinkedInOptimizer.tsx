import { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Sparkles, Copy, CheckCircle, RotateCcw, Loader2, Briefcase } from 'lucide-react';
import { optimizeLinkedIn } from '../services/api';

export const LinkedInOptimizer = () => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const resumeText = localStorage.getItem('lastExtractedText') || '';

  const handleOptimize = async () => {
    if (!resumeText) {
      alert("Please upload your resume in the Dashboard first!");
      return;
    }
    setLoading(true);
    try {
      const data = await optimizeLinkedIn(resumeText);
      setProfileData(data);
    } catch (error) {
      console.error(error);
      alert("LinkedIn optimization failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-[#0A66C2]/10 rounded-3xl flex items-center justify-center text-[#0A66C2] mx-auto mb-6 shadow-2xl">
            <Linkedin className="w-10 h-10 fill-current" />
          </motion.div>
          <h1 className="text-5xl font-black italic tracking-tighter mb-4">LinkedIn Architect</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">Transform your resume into a high-converting professional brand that attracts top recruiters.</p>
        </header>

        {!profileData ? (
          <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[3rem] text-center space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A66C2]/5" />
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-[#0A66C2] mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-bold mb-4">AI Profile Blueprint</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">Our AI will analyze your {resumeText ? 'last uploaded' : 'uploaded'} resume to craft the perfect Headline, About section, and Experience descriptions for LinkedIn.</p>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="px-10 py-4 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 mx-auto transition-all shadow-xl shadow-[#0A66C2]/20 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'CRAFTING YOUR BRAND...' : 'GENERATE LINKEDIN PROFILE'}
              </button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Headline Section */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] group relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0A66C2]">Professional Headline</h3>
                <button onClick={() => copyToClipboard(profileData.headline, 'headline')} className="text-slate-500 hover:text-white transition-colors">
                  {copiedField === 'headline' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-2xl font-bold leading-tight text-white">{profileData.headline}</p>
            </div>

            {/* About Section */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] group relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0A66C2]">About Section</h3>
                <button onClick={() => copyToClipboard(profileData.about, 'about')} className="text-slate-500 hover:text-white transition-colors">
                  {copiedField === 'about' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{profileData.about}</p>
            </div>

            {/* Experience Optimizer */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0A66C2] mb-8">Role Bullet Points</h3>
              <div className="space-y-6">
                {profileData.experience.map((exp: any, i: number) => (
                  <div key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800/50 group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#0A66C2]" /> {exp.company}</div>
                      <button onClick={() => copyToClipboard(exp.bulletPoints, `exp-${i}`)} className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedField === `exp-${i}` ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{exp.bulletPoints}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={handleOptimize} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                <RotateCcw className="w-4 h-4" /> Re-generate
              </button>
              <button onClick={() => setProfileData(null)} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                <RotateCcw className="w-4 h-4" /> Start Over
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
