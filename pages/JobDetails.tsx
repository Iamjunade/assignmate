
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  User,
  ChevronLeft,
  Share2,
  Flag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState('');

  const [renegotiating, setRenegotiating] = useState(false);
  const [newBudget, setNewBudget] = useState(0);
  const [newDeadline, setNewDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  useEffect(() => {
    if (job) {
      setProgress(job.completion_percentage || 0);
      setNewBudget(job.budget || 0);
      setNewDeadline(job.deadline || '');
    }
  }, [job]);

  const loadJob = async () => {
    try {
      const data = await db.getProjectById(jobId!);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      toast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!proposal.trim()) return;

    setApplying(true);
    try {
      await db.submitProposal(jobId!, {
        writer_id: user.id,
        writer_name: user.handle,
        cover_letter: proposal,
        status: 'pending'
      });
      toast('Proposal submitted successfully!', 'success');
      setProposal('');
    } catch (error) {
      console.error('Error applying:', error);
      toast('Failed to submit proposal', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!user || !job) return;
    setUpdating(true);
    try {
      await db.updateOrderStatus(job.id, job.status, user.id); // Base update
      // Need to patch updateOrderStatus or just update the doc manually for percentage since it wasn't exposed?
      // The current `updateOrderStatus` in `firestoreService` only updates status. 
      // Implementation plan didn't specify updating `updateOrderStatus` to take percentage.
      // Let's assume we update the doc directly here for now as a quick fix or if `updateOrderStatus` handles it implicitly (it doesn't).
      // Actually, let's update `updateOrderStatus` to accept percentage later or use a raw update here.
      // For now, let's assume `updateOrderStatus` might be insufficient. 
      // Let's use a direct update for now to ensure it works.
      const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
      await updateDoc(doc(getFirestore(), 'orders', job.id), {
        completion_percentage: progress,
        updated_at: new Date().toISOString()
      });

      toast('Progress updated!', 'success');
      setJob((prev: any) => ({ ...prev, completion_percentage: progress }));
    } catch (error) {
      console.error("Failed to update progress", error);
      toast('Failed to update progress', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRenegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    setUpdating(true);
    try {
      await db.sendRenegotiation(
        job.chat_id,
        job.id,
        user.id,
        user.handle || user.full_name,
        {
          title: job.title,
          description: job.description,
          deadline: newDeadline,
          budget: Number(newBudget),
          pages: job.pages || 0
        }
      );
      toast('Renegotiation offer sent to chat!', 'success');
      setRenegotiating(false);
    } catch (error) {
      console.error("Failed to send renegotiation", error);
      toast('Failed to send request', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle size={48} />
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <button onClick={() => navigate('/projects')} className="text-red-400 hover:underline">Back to Projects</button>
      </div>
    );
  }

  const isOwner = user?.id === job.student_id;
  const isWriter = user?.id === job.writer_id;
  const isParticipant = isOwner || isWriter;

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-8 border-slate-800/50">
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl font-bold text-white leading-tight">{job.title}</h1>
                  <div className="flex gap-2">
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                      <Share2 size={18} />
                    </button>
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                      <Flag size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full">
                    <DollarSign size={16} />
                    ${job.amount || job.budget_min || job.budget || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                    <Clock size={16} />
                    Due {new Date(job.deadline || job.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                    <MapPin size={16} />
                    Remote
                  </div>
                </div>

                {isParticipant && job.status === 'in_progress' && (
                  <div className="py-4 border-y border-slate-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">engineering</span>
                        Project Progress
                      </h3>
                      <span className="text-2xl font-bold text-orange-500">{progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleUpdateProgress}
                        disabled={updating}
                        className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {updating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={18} />}
                        Update Progress
                      </button>
                      <button
                        onClick={() => setRenegotiating(!renegotiating)}
                        className="px-4 py-2 border border-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">edit_note</span>
                        Renegotiate Terms
                      </button>
                    </div>

                    {renegotiating && (
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-white">Propose New Terms</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-bold uppercase">New Budget</label>
                            <input
                              type="number"
                              value={newBudget}
                              onChange={(e) => setNewBudget(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-bold uppercase">New Deadline</label>
                            <input
                              type="date"
                              value={newDeadline}
                              onChange={(e) => setNewDeadline(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setRenegotiating(false)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRenegotiate}
                            disabled={updating}
                            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Send Proposal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Description</h3>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills || ['Academic Writing', 'Research', 'English Proficiency']).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-red-600/10 text-red-400 text-xs font-semibold rounded-lg border border-red-900/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Application Section - Only show if Writer and NOT active */}
            {user?.is_writer && !isParticipant && (
              <GlassCard className="p-8 border-slate-800/50 space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send size={24} className="text-red-500" />
                  Apply for this Project
                </h3>
                <form onSubmit={handleApply} className="space-y-4">
                  <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Describe why you're a good fit for this project..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white min-h-[150px] focus:ring-2 focus:ring-red-500/50 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {applying ? <Loader2 className="animate-spin" /> : 'Submit Proposal'}
                  </button>
                </form>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-6 border-slate-800/50 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">About the Hirer</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-bold text-white">{job.hirer_name || job.writer_handle || 'Project Owner'}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <CheckCircle2 size={12} className="text-blue-400" />
                    Payment Verified
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase">Jobs Posted</p>
                  <p className="text-sm font-bold text-white">12</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase">Hires</p>
                  <p className="text-sm font-bold text-white">85%</p>
                </div>
              </div>
              <button className="w-full py-2 text-sm text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors">
                View History
              </button>
            </GlassCard>

            <GlassCard className="p-6 border-slate-800/50 space-y-4 bg-gradient-to-br from-slate-900/50 to-red-950/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-500" />
                Safety Tips
              </h3>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li>Never share personal contact info before a contract.</li>
                <li>Work within the Assignmate Workroom.</li>
                <li>Ensure milestones are funded before starting.</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
