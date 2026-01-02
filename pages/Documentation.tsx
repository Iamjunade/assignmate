import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { documentationData, searchDocs, DocSection, DocContent } from '../data/documentation';
import { Search, Menu, X, ChevronRight, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

export const Documentation = () => {
    const { section: sectionParam } = useParams();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState(sectionParam || 'introduction');
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<DocSection[]>([]);

    // Update active section when URL changes
    useEffect(() => {
        if (sectionParam) {
            setActiveSection(sectionParam);
        }
    }, [sectionParam]);

    // Search functionality
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const results = searchDocs(searchQuery);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const currentSection = useMemo(() => {
        return documentationData.find(s => s.id === activeSection) || documentationData[0];
    }, [activeSection]);

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        navigate(`/docs/${sectionId}`);
        setSidebarOpen(false);
        setSearchQuery('');
    };

    const renderContent = (content: DocContent, index: number) => {
        switch (content.type) {
            case 'heading':
                return (
                    <h3 key={index} className="text-xl font-bold text-text-main mt-8 mb-4 first:mt-0 flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                        {content.content as string}
                    </h3>
                );
            case 'paragraph':
                return (
                    <p key={index} className="text-secondary leading-relaxed mb-4">
                        {content.content as string}
                    </p>
                );
            case 'list':
                return (
                    <ul key={index} className="space-y-2 mb-6 ml-4">
                        {(content.content as string[]).map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-secondary">
                                <ChevronRight size={16} className="text-primary mt-1 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                );
            case 'code':
                return (
                    <pre key={index} className="bg-[#1e1e1e] text-gray-100 p-4 rounded-xl overflow-x-auto mb-6 text-sm font-mono">
                        <code>{content.content as string}</code>
                    </pre>
                );
            case 'tip':
                return (
                    <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl mb-6">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-600">lightbulb</span>
                            <p className="text-green-800 text-sm">{content.content as string}</p>
                        </div>
                    </div>
                );
            case 'warning':
                return (
                    <div key={index} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-600">warning</span>
                            <p className="text-amber-800 text-sm">{content.content as string}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background font-display">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Back */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} className="text-secondary" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg overflow-hidden">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-bold text-text-main">AssignMate Docs</h1>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-4">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search documentation..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                                />
                                {/* Search Results Dropdown */}
                                <AnimatePresence>
                                    {searchResults.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-light overflow-hidden z-50"
                                        >
                                            {searchResults.map(result => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleSectionClick(result.id)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                                                >
                                                    <span className="material-symbols-outlined text-primary text-lg">{result.icon}</span>
                                                    <span className="font-medium text-text-main">{result.title}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex">
                {/* Sidebar */}
                <AnimatePresence>
                    {(sidebarOpen || window.innerWidth >= 1024) && (
                        <motion.aside
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white lg:bg-transparent border-r border-border-light lg:border-0 z-40 overflow-y-auto ${sidebarOpen ? 'block' : 'hidden lg:block'}`}
                        >
                            <nav className="p-4 lg:p-6 space-y-1">
                                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 px-3">
                                    Documentation
                                </p>
                                {documentationData.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => handleSectionClick(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeSection === section.id
                                                ? 'bg-primary text-white font-bold shadow-md'
                                                : 'text-secondary hover:bg-gray-100 hover:text-text-main'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${activeSection === section.id ? '' : 'opacity-70'}`}>
                                            {section.icon}
                                        </span>
                                        <span className="text-sm">{section.title}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Quick Links */}
                            <div className="p-4 lg:p-6 border-t border-border-light mt-4">
                                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 px-3">
                                    Quick Links
                                </p>
                                <a
                                    href="/feed"
                                    className="flex items-center gap-3 px-3 py-2 text-secondary hover:text-primary text-sm transition-colors"
                                >
                                    <ExternalLink size={16} />
                                    <span>Go to Dashboard</span>
                                </a>
                                <a
                                    href="/writers"
                                    className="flex items-center gap-3 px-3 py-2 text-secondary hover:text-primary text-sm transition-colors"
                                >
                                    <ExternalLink size={16} />
                                    <span>Find Writers</span>
                                </a>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)] p-6 lg:p-10">
                    <motion.article
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-3xl"
                    >
                        {/* Section Header */}
                        <div className="mb-8 pb-6 border-b border-border-light">
                            <div className="flex items-center gap-3 text-primary mb-3">
                                <span className="material-symbols-outlined text-2xl">{currentSection.icon}</span>
                                <span className="text-sm font-bold uppercase tracking-wider">Documentation</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-text-main">
                                {currentSection.title}
                            </h1>
                        </div>

                        {/* Section Content */}
                        <div className="prose prose-lg max-w-none">
                            {currentSection.content.map((item, index) => renderContent(item, index))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-12 pt-8 border-t border-border-light flex justify-between items-center">
                            {documentationData.findIndex(s => s.id === activeSection) > 0 && (
                                <button
                                    onClick={() => {
                                        const currentIndex = documentationData.findIndex(s => s.id === activeSection);
                                        if (currentIndex > 0) {
                                            handleSectionClick(documentationData[currentIndex - 1].id);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-secondary hover:text-primary transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                    <span className="font-medium">Previous</span>
                                </button>
                            )}
                            <div className="flex-1" />
                            {documentationData.findIndex(s => s.id === activeSection) < documentationData.length - 1 && (
                                <button
                                    onClick={() => {
                                        const currentIndex = documentationData.findIndex(s => s.id === activeSection);
                                        if (currentIndex < documentationData.length - 1) {
                                            handleSectionClick(documentationData[currentIndex + 1].id);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <span>Next: {documentationData[documentationData.findIndex(s => s.id === activeSection) + 1]?.title}</span>
                                    <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </motion.article>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-border-light py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-secondary">
                        © 2026 AssignMate. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-secondary">
                        <a href="/pitch" className="hover:text-primary transition-colors">About Us</a>
                        <a href="/auth" className="hover:text-primary transition-colors">Login</a>
                        <a href="/writers" className="hover:text-primary transition-colors">Find Writers</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
