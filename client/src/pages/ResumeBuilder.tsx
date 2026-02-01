import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Wand2, Plus, Trash2, Linkedin, Mail, Phone, Globe, Sparkles, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { autoFillResume } from '../services/api';
import jsPDF from 'jspdf';

export const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [resume, setResume] = useState({
    personal: { fullName: '', email: '', phone: '', linkedin: '', github: '', website: '', summary: '' },
    experience: [{ id: 1, role: '', company: '', date: '', description: '' }],
    education: [{ id: 1, degree: '', school: '', date: '' }],
    skills: ['React', 'Node.js', 'Typescript'],
    projects: [{ id: 1, title: '', link: '', description: '' }]
  });

  const handleAutoFill = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const data = await autoFillResume(aiInput);
      setResume(data);
      setShowAiModal(false);
      setAiInput('');
    } catch (error) {
      console.error(error);
      alert("AI Auto-fill failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setResume({ ...resume, personal: { ...resume.personal, [e.target.name]: e.target.value } });
  };

  const handleArrayChange = (section: 'experience' | 'education' | 'projects', id: number, field: string, value: string) => {
    setResume({
      ...resume,
      [section]: resume[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addItem = (section: 'experience' | 'education' | 'projects') => {
    const defaultItems = {
      experience: { id: Date.now(), role: '', company: '', date: '', description: '' },
      education: { id: Date.now(), degree: '', school: '', date: '' },
      projects: { id: Date.now(), title: '', link: '', description: '' }
    };
    setResume({ ...resume, [section]: [...resume[section], defaultItems[section]] });
  };

  const removeItem = (section: keyof typeof resume, id: number) => {
    setResume({ ...resume, [section]: (resume[section] as any[]).filter((item: any) => item.id !== id) });
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      setResume({ ...resume, skills: [...resume.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResume({ ...resume, skills: resume.skills.filter(s => s !== skillToRemove) });
  };

  const [newSkill, setNewSkill] = useState('');

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume.personal.fullName || 'resume'}.pdf`);
    } catch (error) {
      console.error("PDF Error", error);
      alert("Error generating PDF. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex pt-20 h-screen overflow-hidden">
      {/* AI Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAiModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-2xl shadow-2xl">
              <button onClick={() => setShowAiModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Resume Architect</h2>
                  <p className="text-slate-400">Paste your raw details, projects, or an old resume text. AI will structure it perfectly.</p>
                </div>
              </div>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Example: I worked at Google for 2 years as a Senior Engineer. I built a search engine and managed a team of 10. My education is from Harvard..."
                className="w-full h-60 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors mb-6 resize-none"
              />
              <button
                onClick={handleAutoFill}
                disabled={loading || !aiInput.trim()}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'AI is working...' : 'GENERATE STRUCTURED RESUME'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Sidebar */}
      <div className="w-1/2 p-8 border-r border-slate-800 flex flex-col h-full">
        <header className="flex justify-between items-center mb-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Resume Architect</h1>
            <p className="text-slate-400 text-sm">Design your professional career identity.</p>
          </div>
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400 hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Wand2 className="w-4 h-4" /> AI Auto-Fill
          </button>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800 flex-shrink-0 no-scrollbar">
          {['personal', 'experience', 'education', 'skills', 'projects'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                  <input name="fullName" value={resume.personal.fullName} onChange={handlePersonalChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:border-cyan-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                    <input name="email" value={resume.personal.email} onChange={handlePersonalChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:border-cyan-500 outline-none transition-all" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                    <input name="phone" value={resume.personal.phone} onChange={handlePersonalChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:border-cyan-500 outline-none transition-all" placeholder="+1 234 567 890" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">LinkedIn</label>
                    <input name="linkedin" value={resume.personal.linkedin} onChange={handlePersonalChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:border-cyan-500 outline-none transition-all" placeholder="linkedin.com/in/user" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Portfolio/Website</label>
                    <input name="website" value={resume.personal.website} onChange={handlePersonalChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:border-cyan-500 outline-none transition-all" placeholder="portfolio.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Summary</label>
                  <textarea name="summary" value={resume.personal.summary} onChange={handlePersonalChange} rows={4} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:border-cyan-500 outline-none transition-all resize-none" placeholder="Brief professional overview..." />
                </div>
              </motion.div>
            )}

            {activeTab === 'experience' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                {resume.experience.map((exp: any) => (
                  <div key={exp.id} className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl relative group hover:border-slate-700 transition-all">
                    <button onClick={() => removeItem('experience', exp.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                        <input value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)} placeholder="Software Engineer" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company</label>
                        <input value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} placeholder="Google" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration</label>
                      <input value={exp.date} onChange={(e) => handleArrayChange('experience', exp.id, 'date', e.target.value)} placeholder="Jan 2022 - Present" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                      <textarea value={exp.description} onChange={(e) => handleArrayChange('experience', exp.id, 'description', e.target.value)} placeholder="Discuss key achievements..." rows={3} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500 resize-none" />
                    </div>
                  </div>
                ))}
                <button onClick={() => addItem('experience')} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 font-bold">
                  <Plus className="w-5 h-5" /> Add Experience
                </button>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Core Skills</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resume.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-sm group">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-cyan-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Add a skill and press Enter..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'education' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                {resume.education.map((edu: any) => (
                  <div key={edu.id} className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl relative group hover:border-slate-700 transition-all">
                    <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Degree</label>
                        <input value={edu.degree} onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)} placeholder="B.Tech Computer Science" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Institution</label>
                        <input value={edu.school} onChange={(e) => handleArrayChange('education', edu.id, 'school', e.target.value)} placeholder="Stanford University" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Graduation Year</label>
                      <input value={edu.date} onChange={(e) => handleArrayChange('education', edu.id, 'date', e.target.value)} placeholder="2024" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-cyan-500" />
                    </div>
                  </div>
                ))}
                <button onClick={() => addItem('education')} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 font-bold">
                  <Plus className="w-5 h-5" /> Add Education
                </button>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                {resume.projects.map((proj: any) => (
                  <div key={proj.id} className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl relative group">
                    <button onClick={() => removeItem('projects', proj.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Title</label>
                        <input value={proj.title} onChange={(e) => handleArrayChange('projects', proj.id, 'title', e.target.value)} placeholder="AI Resume Architect" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link (Github/Live)</label>
                        <input value={proj.link} onChange={(e) => handleArrayChange('projects', proj.id, 'link', e.target.value)} placeholder="github.com/user/proj" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none" />
                      </div>
                    </div>
                    <textarea value={proj.description} onChange={(e) => handleArrayChange('projects', proj.id, 'description', e.target.value)} placeholder="Short impact statement..." rows={2} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm outline-none resize-none" />
                  </div>
                ))}
                <button onClick={() => addItem('projects')} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 font-bold">
                  <Plus className="w-5 h-5" /> Add Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Real-time Preview */}
      <div className="w-1/2 bg-slate-900/50 p-8 flex items-start justify-center overflow-auto h-full scrollbar-hidden">
        <div ref={previewRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 shadow-2xl origin-top transform scale-[0.55] lg:scale-[0.7] mb-20 flex flex-col">
          {/* Header Rendering */}
          <header className="border-b-4 border-slate-800 pb-6 mb-8 text-center sm:text-left">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-slate-950 leading-none">
              {resume.personal.fullName || 'YOUR NAME'}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-semibold text-slate-600">
              {resume.personal.email && (
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {resume.personal.email}</span>
              )}
              {resume.personal.phone && (
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {resume.personal.phone}</span>
              )}
              {resume.personal.linkedin && (
                <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-slate-400" /> {resume.personal.linkedin}</span>
              )}
              {resume.personal.website && (
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> {resume.personal.website}</span>
              )}
            </div>
          </header>

          {/* Content Body */}
          <div className="grid grid-cols-1 gap-10 flex-1">
            {resume.personal.summary && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 mb-3 border-b-2 border-slate-100 pb-1 flex items-center gap-2">
                  Professional Summary
                </h2>
                <p className="text-[13px] leading-relaxed text-slate-700 text-justify">{resume.personal.summary}</p>
              </section>
            )}

            {/* Experience Rendering */}
            {resume.experience.length > 0 && resume.experience[0].role && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 mb-4 border-b-2 border-slate-100 pb-1">Work Experience</h2>
                <div className="space-y-6">
                  {resume.experience.map((exp: any) => (
                    <div key={exp.id} className="relative pl-4 border-l-2 border-slate-100 italic">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-[15px] text-slate-900 not-italic">{exp.role}</h3>
                        <span className="text-[11px] font-black text-slate-400 whitespace-nowrap">{exp.date}</span>
                      </div>
                      <p className="text-[13px] font-bold text-slate-600 mb-2 not-italic">{exp.company}</p>
                      <p className="text-[12px] text-slate-700 not-italic whitespace-pre-wrap leading-snug">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-10">
              {/* Left Column (Skills & Projects) */}
              <div className="space-y-8">
                {resume.skills.length > 0 && (
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 mb-4 border-b-2 border-slate-100 pb-1">Technical Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, i) => (
                        <span key={i} className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm">{skill}</span>
                      ))}
                    </div>
                  </section>
                )}

                {resume.projects.length > 0 && resume.projects[0].title && (
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 mb-4 border-b-2 border-slate-100 pb-1">Key Projects</h2>
                    <div className="space-y-4">
                      {resume.projects.map((proj: any) => (
                        <div key={proj.id}>
                          <h3 className="font-bold text-[13px] text-slate-800">{proj.title}</h3>
                          <p className="text-[10px] text-cyan-700 underline mb-1">{proj.link}</p>
                          <p className="text-[12px] text-slate-600 leading-tight">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column (Education) */}
              <div className="space-y-8">
                {resume.education.length > 0 && resume.education[0].school && (
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 mb-4 border-b-2 border-slate-100 pb-1">Education</h2>
                    <div className="space-y-4">
                      {resume.education.map((edu: any) => (
                        <div key={edu.id}>
                          <h3 className="font-bold text-[13px] text-slate-900">{edu.school}</h3>
                          <p className="text-[12px] text-slate-600">{edu.degree}</p>
                          <span className="text-[11px] font-bold text-slate-400">{edu.date}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Footer Tagline */}
          <div className="mt-auto pt-10 text-center">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Generated by AiPoweredResume.io</span>
          </div>
        </div>

        <div className="fixed bottom-8 right-8 flex gap-4 z-50">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full font-black shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <Download className="w-5 h-5 shadow-sm" /> DOWNLOAD RESUME PDF
          </button>
        </div>
      </div>
    </div>
  );
};
