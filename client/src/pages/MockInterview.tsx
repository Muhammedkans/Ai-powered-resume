import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, Send, CheckCircle2, AlertCircle, Loader2, Award, ChevronRight, User, Bot } from 'lucide-react';
import { generateQuestions, evaluateAnswer } from '../services/api';

interface Feedback {
  score: number;
  strengths: string;
  weaknesses: string;
  modelAnswer: string;
}

export const MockInterview = () => {
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState(''); // In a real app, this would come from the database/state
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      // For demo purposes, we'll ask for resume text if not present
      // In production, we'd fetch this from the user's uploaded resume
      const storedResume = localStorage.getItem('lastExtractedText') || "";
      const result = await generateQuestions(storedResume, jobDescription);
      setQuestions(result.questions);
      setStep('interview');
    } catch (error) {
      console.error(error);
      alert("Failed to start interview. Make sure you've uploaded a resume first.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) return;

    setLoading(true);
    try {
      const result = await evaluateAnswer(questions[currentQuestionIndex], currentAnswer, jobDescription);
      const newFeedbacks = [...feedbacks, result.evaluation];
      setFeedbacks(newFeedbacks);
      setAnswers([...answers, currentAnswer]);
      setCurrentAnswer('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setStep('results');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            AI MOCK INTERVIEWER
          </h1>
          <p className="text-slate-400">Master your technical interviews with personalized AI feedback.</p>
        </header>

        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Ready to Practice?</h2>
                  <p className="text-sm text-slate-400">Paste the job description you're preparing for.</p>
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the Job Description here..."
                className="w-full h-48 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors mb-6 resize-none"
              />

              <button
                onClick={handleStartInterview}
                disabled={loading || !jobDescription.trim()}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {loading ? 'Analyzing...' : 'Start Mock Interview'}
              </button>
            </motion.div>
          )}

          {step === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Question Box */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div key={i} className={`h-1 w-4 rounded-full ${i <= currentQuestionIndex ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white leading-relaxed">
                  {questions[currentQuestionIndex]}
                </h3>
              </div>

              {/* Chat Interface */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 min-h-[300px] flex flex-col">
                  <div className="flex-1 space-y-4 mb-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="bg-slate-900 px-4 py-2 rounded-2xl text-sm border border-slate-700 max-w-[80%] text-slate-300">
                        Go ahead and provide your answer. Be as detailed as possible!
                      </div>
                    </div>

                    {currentAnswer && (
                      <div className="flex gap-3 justify-end">
                        <div className="bg-cyan-600 px-4 py-2 rounded-2xl text-sm max-w-[80%] text-white">
                          {currentAnswer}
                        </div>
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleNextQuestion}
                      disabled={loading || !currentAnswer.trim()}
                      className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-2xl flex items-center justify-center self-end transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-slate-900 to-blue-900 border border-blue-500/20 p-8 rounded-3xl text-center">
                <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                <h2 className="text-3xl font-black mb-2">Interview Complete!</h2>
                <p className="text-blue-200">Here's a breakdown of your performance.</p>
                <div className="flex justify-center gap-10 mt-8">
                  <div>
                    <div className="text-4xl font-black text-white">{Math.round(feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length)}/10</div>
                    <div className="text-xs uppercase font-bold text-blue-300 tracking-wider">Average Score</div>
                  </div>
                  <div className="w-px h-12 bg-blue-500/30" />
                  <div>
                    <div className="text-4xl font-black text-white">{questions.length}</div>
                    <div className="text-xs uppercase font-bold text-blue-300 tracking-wider">Questions Asked</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {feedbacks.map((feedback, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400">Q{i + 1}</div>
                        <h4 className="font-bold text-slate-200">{questions[i]}</h4>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${feedback.score >= 8 ? 'bg-green-500/10 text-green-400' : feedback.score >= 5 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                        Score: {feedback.score}/10
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase mb-2">
                          <CheckCircle2 className="w-4 h-4" /> Your Strengths
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{feedback.strengths}</p>
                      </div>
                      <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-2">
                          <AlertCircle className="w-4 h-4" /> Improvement Areas
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{feedback.weaknesses}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <h5 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-2 italic">
                        <Bot className="w-3 h-3" /> The Perfect Response
                      </h5>
                      <p className="text-sm text-slate-300 leading-relaxed text-justify italic">
                        "{feedback.modelAnswer}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('setup')}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl font-bold transition-all"
              >
                Try Another Interview
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
