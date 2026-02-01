import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Briefcase, X, Loader2 } from 'lucide-react';
import { getApplications, createApplication, updateApplicationStatus, deleteApplication } from '../services/api';

const STATUS_COLUMNS = ['Saved', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

export const Tracker = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newApp, setNewApp] = useState({ company: '', role: '', status: 'Saved', notes: '', jobUrl: '' });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const data = await getApplications();
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newApp.company || !newApp.role) return;
    try {
      await createApplication(newApp);
      setShowAddModal(false);
      setNewApp({ company: '', role: '', status: 'Saved', notes: '', jobUrl: '' });
      fetchApps();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateApplicationStatus(id, newStatus);
      fetchApps();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteApplication(id);
      fetchApps();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">CAREER TRACKER</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Manage your job search pipeline like a pro.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </header>

        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {STATUS_COLUMNS.map(column => (
              <div key={column} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{column}</h3>
                  <span className="bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {applications.filter(a => a.status === column).length}
                  </span>
                </div>

                <div className="space-y-4 min-h-[500px]">
                  {applications.filter(a => a.status === column).map(app => (
                    <motion.div
                      layoutId={app._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={app._id}
                      className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl hover:border-slate-700 transition-all group relative cursor-pointer"
                    >
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500">
                          <Briefcase className="w-3 h-3" /> {app.company}
                        </div>
                        <h4 className="font-bold text-slate-100">{app.role}</h4>

                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(app.dateApplied).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-1 mt-4">
                          {STATUS_COLUMNS.map(s => (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(app._id, s);
                              }}
                              className={`w-2 h-2 rounded-full transition-all ${app.status === s ? 'bg-cyan-500 scale-125' : 'bg-slate-800 hover:bg-slate-700'}`}
                              title={s}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl">
                <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-black mb-6">Log New Application</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Company Name</label>
                    <input
                      type="text"
                      value={newApp.company}
                      onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 transition-colors"
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Role / Title</label>
                    <input
                      type="text"
                      value={newApp.role}
                      onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 transition-colors"
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Status</label>
                      <select
                        value={newApp.status}
                        onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 transition-colors"
                      >
                        {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Job URL (Optional)</label>
                      <input
                        type="text"
                        value={newApp.jobUrl}
                        onChange={(e) => setNewApp({ ...newApp, jobUrl: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 transition-colors"
                        placeholder="LinkedIn/Indeed link"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full mt-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-900/20"
                >
                  SAVE APPLICATION
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
