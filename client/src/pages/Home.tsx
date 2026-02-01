import React from 'react';
import { Bot, FileText, Upload, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm text-cyan-200 font-medium">AI-Powered Career Architect</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Build Your <span className="gradient-text">Future Career</span> <br />
            with Artificial Intelligence
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Stop guessing. Let our AI analyze your resume, optimize it for ATS,
            conduct mock interviews, and match you with your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Resume
            </Link>
            <Link
              to="/builder"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <FileText className="w-5 h-5" />
              Build from Scratch
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl">
          {[
            {
              icon: <Bot className="w-8 h-8 text-cyan-400" />,
              title: "AI Mock Interviewer",
              desc: "Practice with our AI that acts like a real interviewer and gives instant feedback."
            },
            {
              icon: <CheckCircle className="w-8 h-8 text-blue-400" />,
              title: "ATS Score Checker",
              desc: "Get a detailed score breakdown and keyword optimization heatmaps."
            },
            {
              icon: <FileText className="w-8 h-8 text-purple-400" />,
              title: "Smart Resume Builder",
              desc: "Create professional resumes with AI-generated bullet points and suggestions."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl glass-card hover:bg-white/10 transition-colors text-left"
            >
              <div className="mb-4 bg-slate-900/50 w-16 h-16 rounded-lg flex items-center justify-center border border-white/5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
