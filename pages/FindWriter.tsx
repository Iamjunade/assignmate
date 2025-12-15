import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FindWriter: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main font-display antialiased selection:bg-primary/30 min-h-screen flex flex-col">
            {/* Navbar is handled by App.tsx layout, but we need to ensure it matches the design or hide it if this page has a custom one. 
                The provided HTML has a custom header. Since we are integrating into an existing app, we might want to use the existing GlassNavigation 
                but style it to match, or hide the global one and use this specific one. 
                For now, let's assume we use the global navigation but we might need to adjust it. 
                However, the user asked for "100% same", so I will implement the header here and we can hide the global one for this route in App.tsx.
            */}

            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#fcfaf8]/90 border-b border-[#f3ede7]">
                <div className="px-4 md:px-6 lg:px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-8 text-primary">
                            <span className="material-symbols-outlined text-4xl leading-none">school</span>
                        </div>
                        <h2 className="text-[#1b140d] text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <button onClick={() => navigate('/')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">Home</button>
                        <button onClick={() => navigate('/writers')} className="text-primary text-sm font-bold">Find a Writer</button>
                        <button onClick={() => navigate('/feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">Post a Job</button>
                        <button onClick={() => navigate('/feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">My Assignments</button>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/auth')} className="hidden sm:flex h-10 px-5 items-center justify-center rounded-full border border-[#e7dbcf] text-sm font-bold text-[#1b140d] hover:bg-[#f3ede7] transition-all">
                            Log In
                        </button>
                        <button onClick={() => navigate('/auth')} className="h-10 px-5 flex items-center justify-center rounded-full bg-primary text-[#1b140d] text-sm font-bold hover:brightness-105 transition-all shadow-md shadow-primary/20">
                            Sign Up
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex flex-col w-full pb-20">
                {/* Breadcrumbs */}
                <div className="w-full px-4 md:px-6 lg:px-4 pt-6">
                    <div className="flex flex-wrap gap-2 text-sm">
                        <a className="text-text-muted hover:text-primary" href="#">Home</a>
                        <span className="text-text-muted">/</span>
                        <span className="text-text-main font-medium">Find a Writer</span>
                    </div>
                </div>

                {/* Hero Section with Map Concept */}
                <section className="w-full px-4 md:px-6 lg:px-4 py-8">
                    <div className="relative w-full rounded-3xl overflow-hidden bg-[#e8e3de] min-h-[360px] flex items-center justify-center">
                        {/* Abstract Map Background */}
                        <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ2-Lqo5AkwRX0FPz5t8hHaw5zVigPSdbaqkLnzAmWh2vkHSP7J2FKNAG014van5cXsBy7za4dBDtVmMfsZNUa2o3PmcfVm7gqQOIamUs8TTefvqS_1SMDkgHuECaUr60ehZpDbIgcbndTc-SJMuIHw8l8hiwm0U9XUYsdYvmH3M4-JwTNBkgOnAgKz0r2a98b1y2kvMVsmCiZ_W6RDsp_JLytVvb9pnziYu04HmdA1_Qir0R06aRqDOMr4EWNS0HckYDi2Y4NcJeo')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8]/90 via-[#fcfaf8]/40 to-transparent z-0"></div>
                        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 text-center px-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                <span className="text-xs font-bold text-text-main uppercase tracking-wider">Hyper-Local Search</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#1b140d] tracking-tight leading-tight">
                                Find a Verified Peer at <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#d67e26]">Your College</span>
                            </h1>
                            <p className="text-lg text-[#5a4633] max-w-xl font-medium">
                                Connect with top-tier students who understand your specific curriculum and grading standards.
                            </p>
                            {/* Search Pill */}
                            <div className="w-full max-w-2xl p-2 bg-white rounded-full shadow-lg shadow-primary/10 flex flex-col md:flex-row items-center gap-2 border border-[#f3ede7]">
                                <div className="flex-1 flex items-center px-4 h-12 w-full">
                                    <span className="material-symbols-outlined text-text-muted">search</span>
                                    <input className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-muted font-medium text-base ml-2 outline-none" placeholder="Search by subject, writer, or course code..." type="text" />
                                </div>
                                <div className="h-8 w-px bg-[#e7dbcf] hidden md:block"></div>
                                <div className="flex-1 flex items-center px-4 h-12 w-full">
                                    <span className="material-symbols-outlined text-text-muted">school</span>
                                    <input className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-muted font-medium text-base ml-2 outline-none" placeholder="College (e.g. IIT Delhi)" type="text" />
                                </div>
                                <button className="w-full md:w-auto h-12 px-8 rounded-full bg-primary text-[#1b140d] font-bold text-base shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sticky Filter Bar */}
                <section className="sticky top-[73px] z-40 w-full bg-[#fcfaf8]/95 backdrop-blur-md border-b border-[#f3ede7] py-3 px-4 md:px-6 lg:px-4">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                        <button className="shrink-0 h-9 px-4 rounded-full bg-text-main text-white text-sm font-medium flex items-center gap-2 shadow-md">
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            All Filters
                        </button>
                        <div className="w-px h-6 bg-[#e7dbcf] mx-1 shrink-0"></div>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-[#f3ede7] hover:bg-[#e7dbcf] text-text-main text-sm font-medium transition-colors border border-transparent hover:border-[#d6c7b9]">
                            Engineering
                        </button>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-[#f3ede7] hover:bg-[#e7dbcf] text-text-main text-sm font-medium transition-colors border border-transparent hover:border-[#d6c7b9]">
                            Management
                        </button>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-text-main text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                            Price: Low to High
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-text-main text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                            Verified Only
                        </button>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-text-main text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px] text-yellow-600">bolt</span>
                            Fast Responder
                        </button>
                    </div>
                </section>

                {/* Main Content Container */}
                <div className="flex flex-col w-full px-4 md:px-6 lg:px-4 py-8 gap-12">
                    {/* Trending Section */}
                    <section>
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-primary">trending_up</span>
                                    <span className="text-primary font-bold text-sm uppercase tracking-wide">Hot Right Now</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-text-main">Trending in Your College</h2>
                            </div>
                            <a className="hidden sm:flex items-center gap-1 text-text-muted font-medium hover:text-primary transition-colors" href="#">
                                View All <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </a>
                        </div>
                        {/* Trending Horizontal Scroll */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Trending Card 1 */}
                            <div className="group relative bg-white rounded-2xl p-4 border border-[#f3ede7] hover:border-primary/30 shadow-soft hover:shadow-hover transition-all duration-300">
                                <div className="absolute top-3 right-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
                                    #1 Trending
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-primary to-yellow-400">
                                            <img alt="Sarah J." className="w-full h-full rounded-full object-cover border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFIhHX4ZGnYjCUykvkK25l_um_GHyQvMPvdqQqyeNBfsIfMc65rjAgZ-k2pPNqW6oF9buU6yVAsgM_WJfrGqn29rSWxACq_aopvS_Qt8oifsFN3ElFWeIw50NHxV3jY2i2Nx1HZtefoEu95pUvYKfXipwdgrsheZmZ65SXtp8JXthck3NXscf3trUFpL-JwZNI34jjm16bk2ewhHi6DOBLWryQhAjd9dw_QBlQorWCv-KGPTdEJWWlTFjdmzlF7efwwuodk_8GeYQ_" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                                            <span className="material-symbols-outlined text-blue-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">Sarah J.</h3>
                                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">school</span>
                                        IIT Bombay
                                    </p>
                                    <div className="flex items-center gap-1 my-3 bg-background-light px-3 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-sm font-bold text-text-main">5.0</span>
                                        <span className="text-xs text-text-muted">(42 jobs)</span>
                                    </div>
                                    <div className="w-full pt-3 border-t border-[#f3ede7] flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Starting at</p>
                                            <p className="text-sm font-bold text-text-main">₹400/page</p>
                                        </div>
                                        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Trending Card 2 */}
                            <div className="group relative bg-white rounded-2xl p-4 border border-[#f3ede7] hover:border-primary/30 shadow-soft hover:shadow-hover transition-all duration-300">
                                <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
                                    Fast Reply
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-gray-200 to-gray-300">
                                            <img alt="Arjun K." className="w-full h-full rounded-full object-cover border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5_5HRG81pCpMxVT6SVod3sg9QY9fWxo2OyY-qo_GrNTir3Dsxo70F1zo7pxJFyH8Qkh21rovl4_rjT0uZ0C38S5s8SOcPX4fyzHNKOgwlHKVx0zuOK18Gftk9ylpq1d2wpOn_8MkFG3DMfplGDckCqvA4zrzSvUYpKTmzm9pKLIkDi_-EybgdXPzFbqmMBGbvFElShbRlfr5HVQf7ocTWaacTPkSAd5bbL2vzw-7rUYUO-jSNcJvzpIu_5xWS3roA9Z0msMp8WERT" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                                            <span className="material-symbols-outlined text-blue-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">Arjun K.</h3>
                                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">school</span>
                                        IIT Bombay
                                    </p>
                                    <div className="flex items-center gap-1 my-3 bg-background-light px-3 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-sm font-bold text-text-main">4.9</span>
                                        <span className="text-xs text-text-muted">(128 jobs)</span>
                                    </div>
                                    <div className="w-full pt-3 border-t border-[#f3ede7] flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Starting at</p>
                                            <p className="text-sm font-bold text-text-main">₹350/page</p>
                                        </div>
                                        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Trending Card 3 (Peer Match) */}
                            <div className="group relative bg-white rounded-2xl p-4 border-2 border-primary/20 hover:border-primary shadow-soft hover:shadow-hover transition-all duration-300">
                                <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-t-2xl"></div>
                                <div className="absolute top-3 left-3 bg-primary text-[#1b140d] text-[10px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">school</span> Peer Match
                                </div>
                                <div className="flex flex-col items-center text-center mt-2">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-primary to-pink-500">
                                            <img alt="Priya M." className="w-full h-full rounded-full object-cover border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB9MGalAWJQzPN8cLc_82cLaYNtVf7oGnHWJiRmA4TQMTuziSiYhR1ckDOtW7Qwe9d3s9se0K1qcX7mHg31rZcRoNLkbflTrqc7Ek7ARhTDEdsLmY5IZg5pLilI303xLRBhQNsn3HRABSn1QS8KtmbDeRvBg2rtG2hqp_mzU5xKMw_uWKfBEAoU-9HhOSPX4xTGnqRvqllhx36r2uqpDz5qxt0nDG2So76Myl8pc4tqXWpPNHplHbRUJvU2Ixp5eNxBKtwvOiMvEWQ" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                                            <span className="material-symbols-outlined text-blue-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">Priya M.</h3>
                                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">school</span>
                                        IIT Bombay
                                    </p>
                                    <div className="flex items-center gap-1 my-3 bg-background-light px-3 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-sm font-bold text-text-main">4.8</span>
                                        <span className="text-xs text-text-muted">(85 jobs)</span>
                                    </div>
                                    <div className="w-full pt-3 border-t border-[#f3ede7] flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Starting at</p>
                                            <p className="text-sm font-bold text-text-main">₹300/page</p>
                                        </div>
                                        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Trending Card 4 */}
                            <div className="group relative bg-white rounded-2xl p-4 border border-[#f3ede7] hover:border-primary/30 shadow-soft hover:shadow-hover transition-all duration-300">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-gray-200 to-gray-300">
                                            <img alt="Rohan D." className="w-full h-full rounded-full object-cover border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoS9nxUT4uULrmoKsuVGnZcoQJXC9bICnjgJ0ugdhlB4azQQdC1vXwaYeYS1Xg8AdxI9SuWHmLM921C1AUN5VAz7eC6KtZxcxpJWGvdygLaBGv-CrDrAc8UC2-WUTgbX9E92-KwzT5oHDBObpP7Lo78gIzLH5FAy6Rmgo2xS4hsS16cfw7_PwH96eNe367S1qE6Mzvb8Jlt_Mjj-YHusGWNqfW1vkW0duwOPEbKrWJCHc2xGk9bZb5ocqDYtPllSV1mI62eluv-vsd" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                                            <span className="material-symbols-outlined text-blue-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">Rohan D.</h3>
                                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">school</span>
                                        IIT Bombay
                                    </p>
                                    <div className="flex items-center gap-1 my-3 bg-background-light px-3 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-sm font-bold text-text-main">4.7</span>
                                        <span className="text-xs text-text-muted">(15 jobs)</span>
                                    </div>
                                    <div className="w-full pt-3 border-t border-[#f3ede7] flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Starting at</p>
                                            <p className="text-sm font-bold text-text-main">₹250/page</p>
                                        </div>
                                        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* All Writers Grid */}
                    <section>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-text-main mb-1">Recommended Writers</h2>
                                <p className="text-text-muted text-sm">Based on your subject search 'Computer Science'</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-text-main">Sort by:</span>
                                <select className="form-select bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer pr-8 pl-0 py-0 outline-none">
                                    <option>Relevance</option>
                                    <option>Price: Low to High</option>
                                    <option>Rating: High to Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* Writer Card Component with full details */}
                            <div className="group bg-white rounded-2xl border border-[#f3ede7] hover:border-primary/40 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col h-full overflow-hidden">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="relative">
                                            <img alt="Writer Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#f3ede7]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5eyA5mJiAk02OyRZxUOxi92h8QvSqP2p2OuZTsHIBnfu3C1q-DRideE6S9kGNKSVuEeXn9ug9NlQoOmIOkzzAIz8BJdpeBEi_NAcbTYluU388uhF8uf1gB0NWCBC3lztv5hqALo16vUsHiH5RhCA1BwmXQU1Jmw_TZhadzWRYJq5f1IuRpBO6p86iRBNjPgUhJbcyOFOCZM7mzQxJJ0XjI5h_bpB7SpNhZeBR1z51ekmD4eSzxTVpu680sgUxbQrrEbkECrGMpbTE" />
                                            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                                Lvl 12
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Active Now
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <h3 className="text-lg font-bold text-text-main">Ananya S.</h3>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                        <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> Mumbai University
                                        </p>
                                    </div>
                                    {/* Chips */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Computer Science</span>
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Python</span>
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Java</span>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-2 text-center bg-background-light rounded-lg p-2">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Rating</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm font-bold text-text-main">4.9</span>
                                                <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            </div>
                                        </div>
                                        <div className="border-l border-[#e7dbcf]">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Jobs</p>
                                            <p className="text-sm font-bold text-text-main">84</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-4 border-t border-[#f3ede7] bg-[#faf8f6] flex items-center justify-between group-hover:bg-white transition-colors">
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Starting from</p>
                                        <p className="text-lg font-bold text-text-main">₹450<span className="text-xs font-normal text-text-muted">/pg</span></p>
                                    </div>
                                    <button className="bg-primary text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                        Hire Now
                                    </button>
                                </div>
                            </div>
                            {/* Writer Card 2 */}
                            <div className="group bg-white rounded-2xl border border-[#f3ede7] hover:border-primary/40 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col h-full overflow-hidden">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="relative">
                                            <img alt="Writer Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#f3ede7]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7lnF4Ol7P-HK3Dde6qSTgd944-WawQkJoyY0oKRFrOH7fAUPJv_DrJMaH1xmP15XMkwO97euR2u9j8PIZWQZ4LpV_fVaA4BbXtE_fLmrIH5Lzn-D_aC75-6xrvKFz3kQVJ4VppGgbA6VqRqMZ5Z5ZqevYi41Hd0C-xrD6pnF6Xqva18TmXm6kH5P10BrEOtan1244teGNdcifyiYHxyIx2X4pc36Pc853_mrLuo_pMt2POvzIckOSfSGK5dMVWR9lyQlzpAWcImWN" />
                                            <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                                Lvl 5
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <h3 className="text-lg font-bold text-text-main">Vikram R.</h3>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                        <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> Delhi University
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Algorithms</span>
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">C++</span>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-2 text-center bg-background-light rounded-lg p-2">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Rating</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm font-bold text-text-main">4.5</span>
                                                <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            </div>
                                        </div>
                                        <div className="border-l border-[#e7dbcf]">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Jobs</p>
                                            <p className="text-sm font-bold text-text-main">12</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-4 border-t border-[#f3ede7] bg-[#faf8f6] flex items-center justify-between group-hover:bg-white transition-colors">
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Starting from</p>
                                        <p className="text-lg font-bold text-text-main">₹250<span className="text-xs font-normal text-text-muted">/pg</span></p>
                                    </div>
                                    <button className="bg-primary text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                        Hire Now
                                    </button>
                                </div>
                            </div>
                            {/* Writer Card 3 */}
                            <div className="group bg-white rounded-2xl border border-[#f3ede7] hover:border-primary/40 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col h-full overflow-hidden">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="relative">
                                            <img alt="Writer Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#f3ede7]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJgifg9eezbKJlCwX7jFenkYcWVC1jE7K577tP3G2Kd_VChO6iVvM7lEIVaPzSD7WpC_qdQqlFXFEnCTQ19e9hy9K4oj0pFzUJV674a7YUd43OcFCI5VNA1ECfxGwLDUAgYi0dUj4GtjAYzLVcpVsXZZUGRADmvbxzBoJ1LrnqG6tAWZckvyLPd9GX25o9YynpAagXlhsO8i-HhS31bVRtRkOHxsK8N0wceCVZDoLRx8R4uO5hdbOMgfaexR1SvpYvvC6NXiuJfiLJ" />
                                            <div className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                                Lvl 24
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                                                <span className="material-symbols-outlined text-[12px]">school</span> PhD Scholar
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <h3 className="text-lg font-bold text-text-main">Dr. Meera K.</h3>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                        <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> BITS Pilani
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Data Science</span>
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Machine Learning</span>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-2 text-center bg-background-light rounded-lg p-2">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Rating</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm font-bold text-text-main">5.0</span>
                                                <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            </div>
                                        </div>
                                        <div className="border-l border-[#e7dbcf]">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Jobs</p>
                                            <p className="text-sm font-bold text-text-main">210</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-4 border-t border-[#f3ede7] bg-[#faf8f6] flex items-center justify-between group-hover:bg-white transition-colors">
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Starting from</p>
                                        <p className="text-lg font-bold text-text-main">₹800<span className="text-xs font-normal text-text-muted">/pg</span></p>
                                    </div>
                                    <button className="bg-primary text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                        Hire Now
                                    </button>
                                </div>
                            </div>
                            {/* Writer Card 4 */}
                            <div className="group bg-white rounded-2xl border border-[#f3ede7] hover:border-primary/40 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col h-full overflow-hidden">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="relative">
                                            <img alt="Writer Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#f3ede7]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBURA_vY8UfMZgRA6ksqDUBtIRFrayZgDkXK67RF5Gb4s8funxS1k0_PLindmyDcFtU4cUOaM_9X5rqouBT-gIdHvrRqQc2eObp-c1RZ8eauwnxKBF9G40YRRuCunI8SGASOjjk8u6uq8g7IpOZcfqyrMgQPhoIU9zmW5K9TZm_QA_WSBk1ULoYj-xBpKvja6HG25GWYNiMA_iOjNLUCCnrPr1l4p1bYNDmbu1jeYk9SZJkkbGTRBt-aRp34uPG7c6ySPN8-5fXPn6U" />
                                            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                                Lvl 8
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <h3 className="text-lg font-bold text-text-main">Kabir Singh</h3>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        </div>
                                        <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> VIT Vellore
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">Web Dev</span>
                                        <span className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">React</span>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-2 text-center bg-background-light rounded-lg p-2">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Rating</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm font-bold text-text-main">4.6</span>
                                                <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            </div>
                                        </div>
                                        <div className="border-l border-[#e7dbcf]">
                                            <p className="text-[10px] text-text-muted font-bold uppercase">Jobs</p>
                                            <p className="text-sm font-bold text-text-main">32</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-4 border-t border-[#f3ede7] bg-[#faf8f6] flex items-center justify-between group-hover:bg-white transition-colors">
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Starting from</p>
                                        <p className="text-lg font-bold text-text-main">₹300<span className="text-xs font-normal text-text-muted">/pg</span></p>
                                    </div>
                                    <button className="bg-primary text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                                        Hire Now
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex justify-center mt-12">
                            <button className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-[#1b140d] transition-colors">
                                Load More Writers
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-[#f3ede7] py-12 px-4 md:px-6 lg:px-4">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-6 text-primary">
                                <span className="material-symbols-outlined text-2xl leading-none">school</span>
                            </div>
                            <h2 className="text-[#1b140d] text-lg font-bold">AssignMate</h2>
                        </div>
                        <p className="text-sm text-text-muted">India's #1 hyper-local student marketplace. Connect with verified peers for assignment help today.</p>
                    </div>
                    <div className="flex gap-12 flex-wrap">
                        <div>
                            <h4 className="font-bold text-[#1b140d] mb-4">Platform</h4>
                            <ul className="flex flex-col gap-2 text-sm text-text-muted">
                                <li><a className="hover:text-primary" href="#">Browse Writers</a></li>
                                <li><a className="hover:text-primary" href="#">How it Works</a></li>
                                <li><a className="hover:text-primary" href="#">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1b140d] mb-4">Support</h4>
                            <ul className="flex flex-col gap-2 text-sm text-text-muted">
                                <li><a className="hover:text-primary" href="#">Help Center</a></li>
                                <li><a className="hover:text-primary" href="#">Safety Guidelines</a></li>
                                <li><a className="hover:text-primary" href="#">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[#e7dbcf] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                    <p>© 2026 AssignMate Inc. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
