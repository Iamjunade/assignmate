import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CommunityGuidelines = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-[#1b140d] dark:text-white">
            {/* Navbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#f3ede7] dark:border-[#3a2e24] bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-4 w-full">
                <div className="flex items-center gap-2 text-[#1b140d] dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                    <div className="size-10 rounded-xl overflow-hidden">
                        <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight">AssignMate</h2>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Home
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full px-6 py-12 md:px-10 lg:px-20">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 mb-6">
                            <span className="material-symbols-outlined text-green-500 text-sm">groups</span>
                            <span className="text-xs font-bold text-green-500 tracking-wide uppercase">Community Standards</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#1b140d] dark:text-white mb-4">
                            Community Guidelines
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Last Updated: January 4, 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-[#2c2219] rounded-3xl p-8 md:p-12 shadow-lg border border-[#e7dbcf] dark:border-[#3a2e24] space-y-8">

                        {/* Introduction */}
                        <section>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                Welcome to the AssignMate community! These guidelines help maintain a respectful, safe, and productive environment for all students. By using our platform, you agree to uphold these standards.
                            </p>
                        </section>

                        {/* Core Values */}
                        <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-2xl p-6 border-l-4 border-green-500">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500">favorite</span> Our Core Values
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-green-500 mt-1">verified</span>
                                    <div>
                                        <h3 className="font-bold text-[#1b140d] dark:text-white">Trust & Safety</h3>
                                        <p className="text-sm">Building a secure environment for all students</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-500 mt-1">handshake</span>
                                    <div>
                                        <h3 className="font-bold text-[#1b140d] dark:text-white">Respect</h3>
                                        <p className="text-sm">Treating everyone with kindness and dignity</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-purple-500 mt-1">school</span>
                                    <div>
                                        <h3 className="font-bold text-[#1b140d] dark:text-white">Academic Integrity</h3>
                                        <p className="text-sm">Supporting learning, not replacing it</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-orange-500 mt-1">balance</span>
                                    <div>
                                        <h3 className="font-bold text-[#1b140d] dark:text-white">Fairness</h3>
                                        <p className="text-sm">Equal opportunities for all members</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 1. Respectful Communication */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">1.</span> Respectful Communication
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-[#1b140d] dark:text-white">✅ DO:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Be polite and professional in all interactions</li>
                                    <li>Communicate clearly about project requirements and deadlines</li>
                                    <li>Respond to messages within a reasonable timeframe</li>
                                    <li>Give constructive feedback respectfully</li>
                                    <li>Use inclusive language that respects diversity</li>
                                </ul>
                                <p className="font-semibold text-red-600 dark:text-red-400 mt-4">❌ DON'T:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Use abusive, hateful, or discriminatory language</li>
                                    <li>Harass, threaten, or intimidate other users</li>
                                    <li>Share personal contact information publicly (use platform messaging)</li>
                                    <li>Spam users with unsolicited messages</li>
                                    <li>Use offensive or inappropriate profile content</li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. Academic Integrity */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">2.</span> Academic Integrity & Ethical Use
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-[#1b140d] dark:text-white">✅ DO:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Use completed work as <strong>study materials and reference guides</strong></li>
                                    <li>Learn from examples and understand the concepts</li>
                                    <li>Properly cite all sources and acknowledge assistance</li>
                                    <li>Follow your institution's academic honesty policies</li>
                                    <li>Use AssignMate for tutoring, proofreading, and research support</li>
                                </ul>
                                <p className="font-semibold text-red-600 dark:text-red-400 mt-4">❌ DON'T:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Submit work completed by others as your own</li>
                                    <li>Request or provide assistance on exams or tests</li>
                                    <li>Plagiarize content from any source</li>
                                    <li>Misrepresent your academic standing or abilities</li>
                                    <li>Encourage others to violate academic integrity policies</li>
                                </ul>
                                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 mt-4 border border-purple-200 dark:border-purple-900/30">
                                    <p className="text-sm">
                                        <strong className="text-purple-700 dark:text-purple-400">Important:</strong> AssignMate is a learning support platform. You are responsible for ensuring your use complies with your institution's policies. Violations may result in account suspension.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Fair Transactions */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">3.</span> Fair & Honest Transactions
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-[#1b140d] dark:text-white">For Students:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide clear, accurate project descriptions and requirements</li>
                                    <li>Set realistic deadlines and budgets</li>
                                    <li>Review and approve work promptly</li>
                                    <li>Release payments once you're satisfied with the work</li>
                                    <li>Leave honest, constructive reviews</li>
                                </ul>
                                <p className="font-semibold text-[#1b140d] dark:text-white mt-4">For Writers:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Only bid on projects you're qualified to complete</li>
                                    <li>Deliver original, high-quality work on time</li>
                                    <li>Communicate proactively about progress or issues</li>
                                    <li>Request revisions professionally if requirements change</li>
                                    <li>Honor your commitments and agreements</li>
                                </ul>
                                <p className="font-semibold text-red-600 dark:text-red-400 mt-4">❌ Prohibited:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Attempting to circumvent the payment system</li>
                                    <li>Requesting or accepting work without payment</li>
                                    <li>Submitting plagiarized or low-quality work</li>
                                    <li>Misrepresenting your skills or portfolio</li>
                                    <li>Creating fake reviews or ratings</li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Profile & Content Standards */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">4.</span> Profile & Content Standards
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-[#1b140d] dark:text-white">✅ DO:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Use your real name or a professional pseudonym</li>
                                    <li>Upload appropriate profile pictures</li>
                                    <li>Keep portfolio items relevant and authentic</li>
                                    <li>Update your skills and bio accurately</li>
                                    <li>Report inappropriate content you encounter</li>
                                </ul>
                                <p className="font-semibold text-red-600 dark:text-red-400 mt-4">❌ DON'T:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Create fake or impersonating accounts</li>
                                    <li>Upload offensive, explicit, or illegal content</li>
                                    <li>Showcase work you didn't create</li>
                                    <li>Include misleading or false information</li>
                                    <li>Share copyrighted materials without permission</li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Privacy & Data Protection */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">5.</span> Privacy & Data Protection
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-[#1b140d] dark:text-white">✅ DO:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Respect other users' privacy and personal information</li>
                                    <li>Use platform messaging for all communications</li>
                                    <li>Keep sensitive project details confidential</li>
                                    <li>Secure your account with a strong password</li>
                                    <li>Report data breaches immediately</li>
                                </ul>
                                <p className="font-semibold text-red-600 dark:text-red-400 mt-4">❌ DON'T:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Share other users' personal information without consent</li>
                                    <li>Screenshot or share private conversations</li>
                                    <li>Access accounts or data you don't have permission to view</li>
                                    <li>Use platform data for marketing or spam purposes</li>
                                </ul>
                            </div>
                        </section>

                        {/* 6. Prohibited Activities */}
                        <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border-l-4 border-red-500">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">block</span> Strictly Prohibited
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-red-600 dark:text-red-400">The following activities will result in immediate account suspension or termination:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Fraud & Scams:</strong> Deceptive practices, payment fraud, fake transactions</li>
                                    <li><strong>Illegal Activities:</strong> Any violation of Indian or local laws</li>
                                    <li><strong>Exam Cheating:</strong> Assistance with live exams, tests, or quizzes</li>
                                    <li><strong>Account Manipulation:</strong> Using bots, creating multiple accounts, vote manipulation</li>
                                    <li><strong>Discrimination:</strong> Harassment based on race, religion, gender, sexuality, disability, etc.</li>
                                    <li><strong>Doxxing:</strong> Publishing private information without consent</li>
                                    <li><strong>Sexual Harassment:</strong> Unwanted advances, explicit content, solicitation</li>
                                    <li><strong>Threats & Violence:</strong> Threatening harm to others</li>
                                    <li><strong>Platform Abuse:</strong> Hacking, system manipulation, exploiting vulnerabilities</li>
                                </ul>
                            </div>
                        </section>

                        {/* 7. Reporting & Enforcement */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">7.</span> Reporting Violations
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>If you encounter behavior that violates these guidelines:</p>
                                <ol className="list-decimal pl-6 space-y-2">
                                    <li><strong>Use the Report Button:</strong> Available on all profiles, messages, and listings</li>
                                    <li><strong>Email Support:</strong> Send details to <strong className="text-green-500">community@assignmate.in</strong></li>
                                    <li><strong>Include Evidence:</strong> Screenshots, chat logs, transaction IDs help us investigate faster</li>
                                    <li><strong>Block Users:</strong> You can block anyone who makes you uncomfortable</li>
                                </ol>
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mt-4 border border-blue-200 dark:border-blue-900/30">
                                    <p className="text-sm flex items-start gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                                        <span><strong className="text-blue-700 dark:text-blue-400">Note:</strong> All reports are reviewed by our Trust & Safety team within 24-48 hours. Reports are confidential and retaliation is prohibited.</span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 8. Consequences */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">8.</span> Consequences of Violations
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>Violations may result in:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Warning:</strong> First-time minor violations receive a written warning</li>
                                    <li><strong>Temporary Suspension:</strong> 7-30 day account suspension for moderate violations</li>
                                    <li><strong>Permanent Ban:</strong> Immediate and permanent removal for severe violations</li>
                                    <li><strong>Withheld Payments:</strong> Funds may be frozen pending investigation</li>
                                    <li><strong>Legal Action:</strong> Illegal activities will be reported to authorities</li>
                                </ul>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    <strong>Appeals:</strong> You may appeal suspensions by emailing <strong>appeals@assignmate.in</strong> within 14 days.
                                </p>
                            </div>
                        </section>

                        {/* 9. Updates */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-green-500">9.</span> Updates to Guidelines
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    We may update these Community Guidelines to reflect platform changes, legal requirements, or community feedback. Significant changes will be communicated via email and in-platform notifications at least 14 days before taking effect.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <section className="bg-gradient-to-r from-orange-50 to-primary/5 dark:from-orange-900/10 dark:to-primary/5 rounded-2xl p-6 border border-orange-200 dark:border-orange-900/30">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">contact_support</span> Questions or Concerns?
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="mb-3">
                                    Our Community Team is here to help!
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">email</span>
                                        <strong>Community Team:</strong> community@assignmate.in
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">support</span>
                                        <strong>General Support:</strong> support@assignmate.in
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">report</span>
                                        <strong>Report Abuse:</strong> Use the in-platform report button or email safety@assignmate.in
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Closing Message */}
                        <div className="pt-8 border-t border-gray-200 dark:border-white/10 text-center">
                            <p className="text-lg font-semibold text-[#1b140d] dark:text-white mb-2">
                                Thank you for being part of the AssignMate community!
                            </p>
                            <p className="text-sm text-gray-500">
                                Together, we create a safe, respectful, and productive learning environment.
                            </p>
                            <p className="text-xs text-gray-400 mt-4">
                                Effective Date: January 4, 2026
                            </p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => navigate('/auth')}
                            className="inline-flex items-center justify-center gap-2 rounded-full h-14 px-10 bg-primary text-[#1b140d] text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-1 transition-all"
                        >
                            Join Our Community
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <p className="mt-4 text-sm text-gray-500">
                            Be a positive force in our student community
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-background-light dark:bg-[#221910] border-t border-[#f3ede7] dark:border-[#3a2e24] px-6 py-8">
                <div className="mx-auto max-w-7xl text-center">
                    <p className="text-sm text-gray-400">© 2024 AssignMate. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
