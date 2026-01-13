import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Footer } from '../components/layout/Footer';
import { Shield, Clock, FileText, Scale } from 'lucide-react';

export const TermsOfService: React.FC = () => {
    return (
        <GlassLayout>
            <div className="min-h-screen flex flex-col">
                <div className="flex-grow max-w-5xl mx-auto py-20 px-6 sm:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center size-20 bg-primary/10 text-primary rounded-3xl mb-8 shadow-inner shadow-primary/20">
                            <Shield size={40} />
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-6">Terms of Service</h1>
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                            <Clock size={16} />
                            <p className="text-lg">Last updated: January 1, 2026</p>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 sm:p-16 shadow-xl">
                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                            <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-12">
                                Welcome to AssignMate. These Terms of Service ("Terms") frame the rules for building a secure, fair, and collaborative learning network. By using our platform, you agree to these principles.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">1</span>
                                Acceptance of Terms
                            </h3>
                            <p>
                                By creating an account or accessing AssignMate, you confirm that you are a university student or educator and agree to comply with these terms. If you do not agree, you must stop using our services immediately.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">2</span>
                                Academic Integrity
                            </h3>
                            <p>
                                AssignMate is built for <strong>learning and collaboration</strong>, not cheating.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                                <li>You agree NOT to use the platform to solicit others to complete assignments, exams, or graded work on your behalf ("contract cheating").</li>
                                <li>You will not provide services that violate the academic honesty policies of your institution or the recipient's institution.</li>
                                <li>We reserve the right to ban any user found soliciting or providing academic dishonesty services.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">3</span>
                                User Conduct & Safety
                            </h3>
                            <p>
                                To maintain a safe environment:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                                <li><strong>Identity:</strong> You must use your real name and valid university credentials. Impersonation is prohibited.</li>
                                <li><strong>Respect:</strong> Harassment, hate speech, or bullying will result in an immediate ban.</li>
                                <li><strong>Payments:</strong> All financial transactions must be conducted through the AssignMate platform to ensure security and dispute resolution. Taking transactions off-platform is a violation of these terms.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">4</span>
                                Content & Copyright
                            </h3>
                            <p>
                                You retain ownership of content you post (notes, questions, guides), but grant AssignMate a license to display and distribute it on the platform. Do not upload copyrighted material (e.g., textbook PDFs) unless you have the right to do so.
                            </p>

                            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10">
                                <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900 dark:text-white">
                                    <Scale className="text-primary" size={20} />
                                    Contact for Legal Issues
                                </h4>
                                <p className="text-sm">
                                    If you have questions about these terms or wish to report a violation, please contact us at <a href="mailto:legal@assignmate.com" className="text-primary hover:underline">legal@assignmate.com</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </GlassLayout>
    );
};
