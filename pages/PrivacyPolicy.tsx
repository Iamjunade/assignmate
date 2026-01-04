import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy = () => {
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
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 mb-6">
                            <span className="material-symbols-outlined text-blue-500 text-sm">security</span>
                            <span className="text-xs font-bold text-blue-500 tracking-wide uppercase">Your Privacy Matters</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#1b140d] dark:text-white mb-4">
                            Privacy Policy
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
                                At AssignMate, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully to understand our practices regarding your personal data.
                            </p>
                        </section>

                        {/* 1. Information We Collect */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">1.</span> Information We Collect
                            </h2>
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <div>
                                    <h3 className="font-bold text-[#1b140d] dark:text-white mb-2">1.1 Personal Information You Provide</h3>
                                    <p className="mb-2">When you create an account or use our services, we collect:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Account Information:</strong> Full name, email address, phone number, date of birth</li>
                                        <li><strong>Profile Information:</strong> School/university name, bio, skills, portfolio items, profile picture</li>
                                        <li><strong>Verification Data:</strong> Government-issued ID (for writer verification only), university enrollment documents</li>
                                        <li><strong>Payment Information:</strong> Bank account details, UPI IDs, transaction history</li>
                                        <li><strong>Communications:</strong> Messages sent through our platform, support tickets, feedback</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#1b140d] dark:text-white mb-2">1.2 Information Collected Automatically</h3>
                                    <p className="mb-2">When you access AssignMate, we automatically collect:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                                        <li><strong>Usage Data:</strong> Pages visited, features used, time spent, clicks, search queries</li>
                                        <li><strong>Location Data:</strong> Approximate location based on IP address (for local matching)</li>
                                        <li><strong>Cookies & Tracking:</strong> Session cookies, performance cookies, analytics data</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#1b140d] dark:text-white mb-2">1.3 Third-Party Information</h3>
                                    <p>If you sign up using Google or other OAuth providers, we receive basic profile information (name, email, profile picture) from those services.</p>
                                </div>
                            </div>
                        </section>

                        {/* 2. How We Use Your Information */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">2.</span> How We Use Your Information
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>We use collected information for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Platform Operation:</strong> Create and manage your account, process transactions, facilitate connections</li>
                                    <li><strong>Trust & Safety:</strong> Verify user identities, prevent fraud, detect abuse, enforce Terms of Service</li>
                                    <li><strong>Personalization:</strong> Match you with relevant writers/clients, recommend services, customize your experience</li>
                                    <li><strong>Communication:</strong> Send transaction updates, notifications, customer support responses, platform announcements</li>
                                    <li><strong>Analytics:</strong> Understand platform usage, improve features, optimize performance</li>
                                    <li><strong>Legal Compliance:</strong> Comply with applicable laws, respond to legal requests, protect our rights</li>
                                    <li><strong>Marketing:</strong> Send promotional emails (with your consent), run targeted advertising campaigns</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. Information Sharing */}
                        <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border-l-4 border-blue-500">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">group</span> Information Sharing & Disclosure
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="font-semibold text-[#1b140d] dark:text-white">We do NOT sell your personal information to third parties.</p>
                                <p>We share information only in these circumstances:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>With Other Users:</strong> Your public profile (name, school, rating, portfolio) is visible to other users for matching purposes</li>
                                    <li><strong>Service Providers:</strong> Payment processors (Razorpay, etc.), cloud hosting (Firebase), analytics (Google Analytics), email services</li>
                                    <li><strong>Legal Requirements:</strong> When required by law, court order, government request, or to protect rights and safety</li>
                                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets (users will be notified)</li>
                                    <li><strong>With Your Consent:</strong> Any other sharing requires your explicit consent</li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Data Security */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">4.</span> Data Security
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>We implement industry-standard security measures to protect your data:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Encryption:</strong> All data transmitted to/from AssignMate is encrypted using SSL/TLS</li>
                                    <li><strong>Secure Storage:</strong> Personal data is stored on secure Firebase servers with access controls</li>
                                    <li><strong>Payment Security:</strong> We use PCI-DSS compliant payment processors; we do NOT store full credit card numbers</li>
                                    <li><strong>ID Verification:</strong> Government IDs are securely stored and only accessible to verification personnel</li>
                                    <li><strong>Employee Access:</strong> Only authorized employees can access personal data, under strict confidentiality agreements</li>
                                    <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                                </ul>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    <strong>Note:</strong> While we implement strong security measures, no system is 100% secure. You are responsible for maintaining the confidentiality of your password.
                                </p>
                            </div>
                        </section>

                        {/* 5. Data Retention */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">5.</span> Data Retention
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Active Accounts:</strong> Data is retained while your account is active</li>
                                    <li><strong>Deleted Accounts:</strong> Most personal data is deleted within 90 days of account deletion</li>
                                    <li><strong>Transaction Records:</strong> Kept for 7 years for financial and legal compliance</li>
                                    <li><strong>Chat Messages:</strong> Retained for dispute resolution purposes for 2 years after transaction completion</li>
                                    <li><strong>Verification Documents:</strong> Securely deleted 90 days after account closure, unless required for legal proceedings</li>
                                </ul>
                            </div>
                        </section>

                        {/* 6. Your Rights & Choices */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">6.</span> Your Rights & Choices
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>You have the following rights regarding your personal data:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                                    <li><strong>Correction:</strong> Update or correct inaccurate information through account settings</li>
                                    <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention requirements)</li>
                                    <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
                                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails via the link in each email</li>
                                    <li><strong>Cookie Control:</strong> Manage cookie preferences through browser settings</li>
                                    <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where consent was the legal basis</li>
                                </ul>
                                <p className="mt-4">
                                    To exercise these rights, contact us at <strong className="text-blue-500">privacy@assignmate.in</strong>
                                </p>
                            </div>
                        </section>

                        {/* 7. Cookies & Tracking */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">7.</span> Cookies & Tracking Technologies
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>We use cookies and similar technologies to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Essential Cookies:</strong> Keep you logged in, remember your preferences</li>
                                    <li><strong>Analytics Cookies:</strong> Understand how users interact with our platform (Google Analytics)</li>
                                    <li><strong>Performance Cookies:</strong> Monitor platform performance and fix bugs</li>
                                    <li><strong>Advertising Cookies:</strong> Deliver relevant ads on third-party platforms</li>
                                </ul>
                                <p className="mt-3">
                                    You can control cookies through your browser settings. Note that blocking essential cookies may impact platform functionality.
                                </p>
                            </div>
                        </section>

                        {/* 8. Third-Party Links */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">8.</span> Third-Party Links & Services
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    AssignMate may contain links to third-party websites or services (payment gateways, social media, portfolio hosting). We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
                                </p>
                            </div>
                        </section>

                        {/* 9. Children's Privacy */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">9.</span> Children's Privacy
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    AssignMate is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18. If you are a parent/guardian and believe your child has provided us with personal data, please contact us immediately at <strong className="text-blue-500">privacy@assignmate.in</strong>.
                                </p>
                            </div>
                        </section>

                        {/* 10. Changes to Privacy Policy */}
                        <section>
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">10.</span> Changes to This Privacy Policy
                            </h2>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>
                                    We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. The "Last Updated" date at the top reflects the most recent revision. Continued use of AssignMate after changes constitutes acceptance of the updated policy.
                                </p>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-900/30">
                            <h2 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500">contact_support</span> Contact Our Privacy Team
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="mb-3">
                                    If you have questions or concerns about this Privacy Policy or our data practices, please contact:
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-lg">email</span>
                                        <strong>Privacy Officer:</strong> privacy@assignmate.in
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-lg">support</span>
                                        <strong>General Support:</strong> support@assignmate.in
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-lg">location_on</span>
                                        <strong>Mailing Address:</strong> AssignMate Technologies Pvt. Ltd., New Delhi, India
                                    </p>
                                </div>
                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days.
                                </p>
                            </div>
                        </section>

                        {/* Effective Date */}
                        <div className="pt-8 border-t border-gray-200 dark:border-white/10 text-center text-sm text-gray-500">
                            <p>This Privacy Policy is effective as of January 4, 2026.</p>
                            <p className="mt-2">Your privacy is important to us. Thank you for trusting AssignMate.</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => navigate('/auth')}
                            className="inline-flex items-center justify-center gap-2 rounded-full h-14 px-10 bg-primary text-[#1b140d] text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-1 transition-all"
                        >
                            Get Started Securely
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <p className="mt-4 text-sm text-gray-500">
                            Your data is protected with bank-grade security
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
