
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

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

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
                    ${job.budget_min} - ${job.budget_max}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                    <Clock size={16} />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                    <MapPin size={16} />
                    Remote
                  </div>
                </div>

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

            {/* Application Section */}
            {user?.role === 'writer' && (
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
                  <p className="font-bold text-white">{job.hirer_name || 'Project Owner'}</p>
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
