import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Volume2, User, Bot, Award, Play, Square, Loader2, AlertCircle } from 'lucide-react';
import { generateQuestions, evaluateAnswer } from '../services/api';

export const MockInterview = () => {
  const [sessionState, setSessionState] = useState<'setup' | 'interview' | 'feedback'>('setup');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewScore, setInterviewScore] = useState<any>(null);

  const resumeText = localStorage.getItem('lastExtractedText') || '';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startInterview = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a Job Description first.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateQuestions(resumeText, jobDescription);
      setQuestions(result.questions);
      setSessionState('interview');
      // Speak first question
      speak(result.questions[0]);
    } catch (error) {
      console.error(error);
      alert("Failed to start interview. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userAnswer.trim()) return;

    const currentQ = questions[currentQuestionIndex];
    const answer = userAnswer;
    setUserAnswer('');

    // Add to history
    setConversation(prev => [...prev, { type: 'bot', text: currentQ }, { type: 'user', text: answer }]);

    setLoading(true);
    try {
      // Get feedback on this specific answer
      const feedback = await evaluateAnswer(currentQ, answer, jobDescription);

      // Store granular feedback if needed, or just proceed
      console.log("Feedback:", feedback);

      if (currentQuestionIndex < questions.length - 1) {
        const nextQ = questions[currentQuestionIndex + 1];
        setCurrentQuestionIndex(prev => prev + 1);
        speak(nextQ);
      } else {
        setSessionState('feedback');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 flex flex-col items-center">
      {sessionState === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-purple-600/10">
              <Bot className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-4xl font-black italic">AI Interview Simulator</h1>
            <p className="text-slate-400 text-lg">Paste the Job Description (JD) below. I will simulate a real technical interview based on your resume and this JD.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group focus-within:border-purple-500/50 transition-colors">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description here..."
              className="w-full h-40 bg-transparent text-slate-300 resize-none outline-none placeholder:text-slate-600 text-sm leading-relaxed"
            />
          </div>

          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
            START INTERVIEW
          </button>
        </motion.div>
      )}

      {sessionState === 'interview' && (
        <div className="max-w-4xl w-full flex flex-col h-[80vh]">
          {/* Header */}
          <header className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Technical Recruiter</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Session
                </div>
              </div>
            </div>
            <div className="bg-slate-900 px-4 py-2 rounded-lg text-sm font-mono text-slate-400 border border-slate-800">
              Q: {currentQuestionIndex + 1} / {questions.length}
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 custom-scrollbar">
            {conversation.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-cyan-600' : 'bg-purple-600'}`}>
                  {msg.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-md ${msg.type === 'user'
                    ? 'bg-cyan-600/10 text-cyan-100 border border-cyan-500/20 rounded-tr-none'
                    : 'bg-purple-600/10 text-purple-100 border border-purple-500/20 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Current Question Typing Indicator or Text */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-purple-600/10 text-purple-100 border border-purple-500/20 max-w-[80%] shadow-lg">
                <p className="text-lg font-medium">{questions[currentQuestionIndex]}</p>
                <button onClick={() => speak(questions[currentQuestionIndex])} className="mt-3 flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-white transition-colors">
                  <Volume2 className="w-4 h-4" /> Replay Audio
                </button>
              </div>
            </motion.div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex items-end gap-3 shadow-2xl relative z-10">
            <div className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20' : 'bg-slate-800'}`}>
              <Mic className={`w-6 h-6 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your answer here..."
              className="flex-1 bg-transparent max-h-32 min-h-[50px] py-3 text-slate-200 outline-none resize-none placeholder:text-slate-600"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !userAnswer.trim()}
              className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

      {sessionState === 'feedback' && (
        <div className="text-center py-20">
          <Award className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-4">Interview Complete!</h2>
          <p className="text-slate-400">Your AI-generated feedback report is ready.</p>
          {/* Add result component here */}
        </div>
      )}
    </div>
  );
};
