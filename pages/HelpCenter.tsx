import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, ExternalLink, HelpCircle, FileText, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqs = [
    {
        category: "Getting Started",
        icon: FileText,
        items: [
            { q: "How do I create a profile?", a: "To create a profile, simply sign up using your email or Google account. Once registered, complete your onboarding steps by adding your university, major, and skills." },
            { q: "Is AssignMate free to use?", a: "Yes! AssignMate is free to join. You can connect with peers, join discussions, and access basic features at no cost." },
            { q: "How do I verify my student status?", a: "We use your university email address for verification. If you signed up with a personal email, you can link your .edu email in your profile settings to get the 'Verified Student' badge." }
        ]
    },
    {
        category: "Community & Connect",
        icon: User,
        items: [
            { q: "How do I connect with other students?", a: "You can find students by searching for their name, university, or major in the 'Find Peers' section. Click 'Connect' to send a request." },
            { q: "What is the difference between Global and Campus feed?", a: "The Campus feed shows posts only from students at your specific university, while the Global feed shows discussions from the entire AssignMate network." },
            { q: "Can I message someone without connecting?", a: "To ensure safety and reduce spam, you must be connected with a user before you can send them a direct message, unless they have 'Open DMs' enabled." }
        ]
    },
    {
        category: "Safety & Trust",
        icon: Shield,
        items: [
            { q: "How do I report a user or post?", a: "You can report any content by clicking the three dots menu on the post or profile and selecting 'Report'. Our team reviews these alerts 24/7." },
            { q: "Is my personal data safe?", a: "Absolutely. We encrypt all sensitive data and never sell your personal information to third parties. You have full control over your privacy settings." },
            { q: "What happens if I forget my password?", a: "You can reset your password from the login page by clicking 'Forgot Password'. We'll send a reset link to your registered email address." }
        ]
    }
];

export const HelpCenter = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const togglefaq = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="min-h-screen bg-[#0d0b09] text-[#F5F5F4] font-body selection:bg-primary selection:text-white pt-20">
            {/* Hero Search */}
            <section className="relative py-24 px-4 overflow-hidden bg-[#15120f] border-b border-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                        <HelpCircle size={14} />
                        Help Center
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">How can we help you?</h1>

                    <div className="relative max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#0d0b09] border border-white/10 text-white placeholder-white/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-lg transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                    </div>
                </div>
            </section>

            {/* Content Categories */}
            <section className="py-20 px-4 max-w-4xl mx-auto">
                <div className="grid gap-12">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((cat, catIndex) => (
                            <div key={catIndex}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white/5 rounded-lg text-primary">
                                        <cat.icon size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold font-display">{cat.category}</h2>
                                </div>
                                <div className="space-y-4">
                                    {cat.items.map((item, index) => {
                                        const id = `${catIndex}-${index}`;
                                        const isOpen = openIndex === id;
                                        return (
                                            <div
                                                key={index}
                                                className={`rounded-xl border transition-all duration-200 overflow-hidden ${isOpen ? 'bg-white/5 border-primary/30' : 'bg-[#15120f] border-white/5 hover:border-white/10'}`}
                                            >
                                                <button
                                                    onClick={() => togglefaq(id)}
                                                    className="w-full flex items-center justify-between p-5 text-left"
                                                >
                                                    <span className={`font-semibold text-lg ${isOpen ? 'text-white' : 'text-[#E6D5B8]/80'}`}>
                                                        {item.q}
                                                    </span>
                                                    {isOpen ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-white/30" />}
                                                </button>
                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                                >
                                                    <div className="p-5 pt-0 text-[#E6D5B8]/60 leading-relaxed border-t border-white/5 mt-2">
                                                        {item.a}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <HelpCircle size={48} className="mx-auto mb-4 text-white/20" />
                            <p className="text-xl">No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-20 bg-[#15120f] border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="font-display text-3xl font-bold mb-6">Still need support?</h2>
                    <p className="text-[#E6D5B8]/60 mb-8 text-lg">Our team is available 24/7 to assist you with any issues.</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => window.location.href = 'mailto:support@assignmate.com'} className="px-8 py-4 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                            <Mail size={20} />
                            Contact Support
                        </button>
                        <button onClick={() => window.open('https://twitter.com/assignmate', '_blank')} className="px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all flex items-center gap-2">
                            <ExternalLink size={20} />
                            Message on X
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
