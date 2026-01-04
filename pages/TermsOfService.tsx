import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService = () => {
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
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
                            <span className="material-symbols-outlined text-primary text-sm">gavel</span>
                            <span className="text-xs font-bold text-primary tracking-wide uppercase">Legal Document</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#1b140d] dark:text-white mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Last Updated: January 4, 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-[#2c2219] rounded-3xl p-8 md:p-12 shadow-lg border border-[#e7dbcf] dark:border-[#3a2e24] space-y-8">

                        {/* Introduction */}
                        <section>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Welcome to AssignMate. These Terms of Service ("Terms") govern your access to and use of AssignMate's platform, services, and website. By accessing or using AssignMate, you agree to be bound by these Terms and our Privacy Policy.
                            </p>
                        </section>

                        {/* 1. Acceptance of Terms */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">1.</span> Acceptance of Terms
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    By creating an account or using any part of AssignMate, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
                                </p>
                                <p>
                                    You must be at least 18 years old or have parental/guardian consent to use AssignMate. By using our platform, you represent and warrant that you meet these requirements.
                                </p>
                            </div>
                        </section>

                        {/* 2. Description of Service */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">2.</span> Description of Service
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    AssignMate is India's premier student marketplace that connects students seeking academic assistance with verified student writers. Our platform provides:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>A secure marketplace for academic collaboration between students</li>
                                    <li>Identity verification services for trust and safety</li>
                                    <li>Escrow payment  system to protect both parties</li>
                                    <li>Communication tools for project coordination</li>
                                    <li>Dispute resolution mechanisms</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. User Accounts */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">3.</span> User Accounts and Verification
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">3.1 Account Creation:</strong> You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">3.2 ID Verification:</strong> To maintain platform integrity, we require government-issued ID verification for writer accounts. verified accounts receive a blue verification badge.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">3.3 Account Security:</strong> You are solely responsible for all activities that occur under your account. Notify us immediately of any unauthorized access or security breaches.
                                </p>
                            </div>
                        </section>

                        {/* 4. Academic Integrity */}
                        <section className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-6 border-l-4 border-primary">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">school</span> Academic Integrity Policy
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p><strong className="text-[#1b140d] dark:text-white">Important:</strong> AssignMate is designed as a learning support platform. All work provided should be used as:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Study guides and reference materials</strong></li>
                                    <li><strong>Tutoring and educational assistance</strong></li>
                                    <li><strong>Research support and proofreading</strong></li>
                                </ul>
                                <p className="text-orange-600 dark:text-orange-400 font-semibold">
                                    Users must not submit work completed by others as their own. You are responsible for ensuring compliance with your institution's academic integrity policies. AssignMate does not condone plagiarism or academic dishonesty.
                                </p>
                            </div>
                        </section>

                        {/* 5. Payments and Fees */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">5.</span> Payments, Fees, and Escrow
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">5.1 Service Fees:</strong> AssignMate charges a platform fee on each transaction. Current fee structures are displayed during the transaction process.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">5.2 Escrow System:</strong> All payments are held in escrow until the client approves the delivered work. This protects both parties and ensures quality delivery.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">5.3 Refunds:</strong> Refund eligibility is determined based on project milestones, delivery status, and our dispute resolution process. See Section 7 for details.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">5.4 Writer Payments:</strong> Writers receive payment after client approval, minus applicable platform fees. Withdrawals are processed within 3-5 business days.
                                </p>
                            </div>
                        </section>

                        {/* 6. User Conduct */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">6.</span> Prohibited Conduct
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>You agree NOT to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Impersonate another person or entity</li>
                                    <li>Circumvent payment systems or attempt fraud</li>
                                    <li>Harass, abuse, or harm other users</li>
                                    <li>Share login credentials or transfer accounts</li>
                                    <li>Use automated tools to access or scrape the platform</li>
                                    <li>Upload malicious code or viruses</li>
                                    <li>Engage in activities that harm AssignMate's reputation</li>
                                </ul>
                            </div>
                        </section>

                        {/* 7. Disputes and Resolution */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">7.</span> Dispute Resolution
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">7.1 Internal Resolution:</strong> If a dispute arises between users, both parties should attempt to resolve it through platform messaging first.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">7.2 Platform Mediation:</strong> If users cannot resolve the dispute, they may escalate to AssignMate's dispute resolution team. Our team will review evidence and make a binding decision.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">7.3 Arbitration:</strong> Any disputes not resolved through platform mediation shall be settled by binding arbitration under Indian law.
                                </p>
                            </div>
                        </section>

                        {/* 8. Intellectual Property */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">8.</span> Intellectual Property Rights
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">8.1 Platform Content:</strong> All platform design, code, logos, and branding are owned by AssignMate and protected by intellectual property laws.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">8.2 User Content:</strong> Users retain ownership of content they create. By using AssignMate, you grant us a license to host, display, and distribute your content as necessary for platform operation.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">8.3 Commissioned Work:</strong> Rights to completed work transfer to the client upon full payment, unless otherwise agreed in writing.
                                </p>
                            </div>
                        </section>

                        {/* 9. Limitation of Liability */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">9.</span> Limitation of Liability
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    AssignMate provides the platform "as is" without warranties of any kind. We are not responsible for:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Quality, accuracy, or legality of user-generated content</li>
                                    <li>Actions or conduct of platform users</li>
                                    <li>Technical failures, data loss, or service interruptions</li>
                                    <li>Academic consequences resulting from misuse of our services</li>
                                    <li>Indirect, incidental, or consequential damages</li>
                                </ul>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    Our total liability shall not exceed the amount paid to AssignMate in the 12 months preceding the claim.
                                </p>
                            </div>
                        </section>

                        {/* 10. Termination */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">10.</span> Account Termination
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">10.1 User Termination:</strong> You may close your account at any time through account settings. Outstanding transactions must be completed first.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">10.2 Platform Termination:</strong> We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice or liability.
                                </p>
                                <p>
                                    <strong className="text-[#1b140d] dark:text-white">10.3 Effect of Termination:</strong> Upon termination, your right to use AssignMate ceases immediately. Completed transactions remain valid, and applicable sections of these Terms survive termination.
                                </p>
                            </div>
                        </section>

                        {/* 11. Changes to Terms */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">11.</span> Modifications to Terms
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    AssignMate reserves the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the modified Terms.
                                </p>
                                <p>
                                    Material changes will include a 30-day notice period before taking effect.
                                </p>
                            </div>
                        </section>

                        {/* 12. Governing Law */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary">12.</span> Governing Law & Jurisdiction
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    These Terms are governed by the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
                                </p>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/30">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">contact_support</span> Contact Us
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="mb-3">
                                    If you have questions about these Terms of Service, please contact us:
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-lg">email</span>
                                        <strong>Email:</strong> legal@assignmate.in
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-lg">support</span>
                                        <strong>Support:</strong> support@assignmate.in
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-lg">location_on</span>
                                        <strong>Address:</strong> AssignMate Technologies Pvt. Ltd., New Delhi, India
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Effective Date */}
                        <div className="pt-8 border-t border-gray-200 dark:border-white/10 text-center text-sm text-gray-500">
                            <p>These Terms of Service are effective as of January 4, 2026.</p>
                            <p className="mt-2">You acknowledge that you have read and understood these Terms.</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => navigate('/auth')}
                            className="inline-flex items-center justify-center gap-2 rounded-full h-14 px-10 bg-primary text-[#1b140d] text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-1 transition-all"
                        >
                            I Accept - Create Account
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <p className="mt-4 text-sm text-gray-500">
                            By creating an account, you agree to these Terms of Service
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
