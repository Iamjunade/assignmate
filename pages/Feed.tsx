import React from 'react';
import { User } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatsRow } from '../components/dashboard/StatsRow';
import { useNavigate } from 'react-router-dom';

interface FeedProps {
    user: User | null;
    onChat?: (writer: User) => void;
}

export const Feed: React.FC<FeedProps> = ({ user, onChat }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#faf9f7] text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20">
                    <div className="max-w-7xl mx-auto flex flex-col gap-8">
                        {/* Welcome Section */}
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                            <div>
                                <div className="text-sm font-bold text-primary mb-1 tracking-wide uppercase">Oct 26 • Student Dashboard</div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight leading-tight">
                                    Good Morning, {user?.full_name?.split(' ')[0] || 'Student'}.
                                </h1>
                                <p className="text-text-muted mt-2 text-lg">Your academic tasks are under control.</p>
                            </div>
                            <div className="xl:max-w-md w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                                <div className="bg-white p-2.5 rounded-full shadow-sm text-emerald-600 z-10">
                                    <span className="material-symbols-outlined">shield_lock</span>
                                </div>
                                <div className="flex-1 z-10">
                                    <h3 className="text-sm font-bold text-text-dark">Escrow Protected Payments</h3>
                                    <p className="text-xs text-text-muted mt-0.5">Funds released only when you're 100% satisfied.</p>
                                </div>
                                <span className="material-symbols-outlined text-emerald-200 absolute -right-4 -bottom-4 text-[100px] opacity-20">verified_user</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <StatsRow />

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Main Content Column */}
                            <div className="xl:col-span-2 flex flex-col gap-8">
                                <section className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                            Active Projects
                                            <span className="bg-gray-100 text-text-muted text-xs font-bold px-2 py-1 rounded-full">2</span>
                                        </h2>
                                        <a href="#" className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">View All Projects</a>
                                    </div>

                                    {/* Project Card 1 */}
                                    <div className="bg-white p-6 rounded-[1.5rem] border border-border-subtle shadow-card hover:shadow-soft transition-all duration-300">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                                            <div className="flex gap-4">
                                                <div className="size-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">article</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-text-dark">Macroeconomics Case Study</h3>
                                                        <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-100">Work In Progress</span>
                                                    </div>
                                                    <p className="text-sm text-text-muted">ID: #AM-2938 • Due: Oct 28 (2 days left)</p>
                                                </div>
                                            </div>
                                            <button className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-muted transition-colors">
                                                <span className="material-symbols-outlined">more_horiz</span>
                                            </button>
                                        </div>

                                        <div className="bg-secondary-bg rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border-subtle mb-5">
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className="relative">
                                                    <div className="size-10 rounded-full bg-cover bg-center border border-white shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKxSFzpM-BgB2qQ1d85Uu51_OIe2WxmiD88HEAUegg7VuQUXqF2zJx5ayTcLg8LFpSt1VZzymsCvpWe6iXRU9caNqM6Y0OK4NigsTiD1C5Lyjtouws27TbM1Uy3R6p0qwSxPX2Ef5aQVoTpNuK6WPS2bB9_rsDbpBhUbpscoJ-vM3yhvifw9uPCcfShnGKCzBCfIdwaS1nFMLyur_omvbWyWlcnB3I0o1dxFBLv1szAxoyLkp-STrKzut7yTDVP9pdv4NDQ2XmLN4e')" }}></div>
                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" title="Verified Writer">
                                                        <span className="material-symbols-outlined text-blue-500 text-[14px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text-dark">Ananya S.</p>
                                                    <p className="text-xs text-text-muted">PhD Candidate • DU</p>
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-48">
                                                <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                                    <span>Completion</span>
                                                    <span>80%</span>
                                                </div>
                                                <div className="w-full bg-white border border-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div className="bg-primary h-2 rounded-full w-[80%]"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-text-dark text-white text-sm font-bold shadow-md hover:bg-gray-800 transition-colors">
                                                <span className="material-symbols-outlined text-lg">description</span> Review Submission
                                            </button>
                                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-border-subtle text-text-dark text-sm font-bold hover:bg-gray-50 transition-colors">
                                                <span className="material-symbols-outlined text-lg text-text-muted">chat</span> Message Writer
                                            </button>
                                            <button className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold hover:bg-emerald-100 transition-colors" disabled title="Draft review required first">
                                                <span className="material-symbols-outlined text-lg">payments</span> Release Payment
                                            </button>
                                        </div>
                                    </div>

                                    {/* Project Card 2 */}
                                    <div className="bg-white p-6 rounded-[1.5rem] border border-border-subtle shadow-card hover:shadow-soft transition-all duration-300 opacity-90">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                                            <div className="flex gap-4">
                                                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">code</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-text-dark">Python Data Analysis Script</h3>
                                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">Awaiting Approval</span>
                                                    </div>
                                                    <p className="text-sm text-text-muted">ID: #AM-2942 • Due: Nov 02</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-secondary-bg rounded-xl p-4 flex items-center justify-between border border-border-subtle border-dashed">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    <div className="size-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-xs font-bold text-text-muted">?</div>
                                                    <div className="size-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-xs font-bold text-text-muted">?</div>
                                                    <div className="size-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-xs font-bold text-text-muted">?</div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text-dark">3 Writers placed bids</p>
                                                    <p className="text-xs text-text-muted">Range: ₹800 - ₹1200</p>
                                                </div>
                                            </div>
                                            <button className="px-5 py-2 rounded-full bg-primary text-text-dark text-sm font-bold shadow-sm hover:shadow-md transition-all">
                                                Review Bids
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Sidebar Column */}
                            <div className="flex flex-col gap-6">
                                {/* Verified Writers Section */}
                                <section className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-text-dark">Verified at Delhi Univ.</h2>
                                        <div className="flex gap-1">
                                            <button className="size-8 rounded-full bg-white border border-border-subtle flex items-center justify-center hover:bg-gray-50 text-text-muted shadow-sm"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                                            <button className="size-8 rounded-full bg-white border border-border-subtle flex items-center justify-center hover:bg-gray-50 text-text-muted shadow-sm"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                                        </div>
                                    </div>

                                    {/* Writer Card 1 */}
                                    <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-card hover:shadow-soft transition-all cursor-pointer group relative">
                                        <div className="absolute top-4 right-4 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Top Rated</div>
                                        <div className="flex items-start gap-4">
                                            <div className="size-14 rounded-2xl bg-cover bg-center shrink-0 border border-border-subtle" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJwAbDMWqosyZVjCnsc2FvbGfSVpRlKToOsMUJ0gciTjews5JTVGd-jEIH-9cLT79vCGU4m0AsrfK-MXFS7ExIr9MCn8teS5Qre6vC8L_bAPPxv8xJL9nMspL0CcreLL6qiIBAjS1LCgnlrPX-nwS8nj8CD8jOKCArJtMHTRV6llT0nFr0j1tLjhADhRBwnMFmndUpmljryDs4BNUi4NeGgE0Mc0Y2Tbi_N8Kmluy4FzkBLIqXTL1LQq5sdVSwI4TKKjvnVC8yg5XP')" }}></div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-text-dark flex items-center gap-1">
                                                    Rohan M.
                                                    <span className="material-symbols-outlined text-blue-500 text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                </h4>
                                                <p className="text-xs text-text-muted truncate">M.Sc Physics • Delhi University</p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    <span className="text-xs font-bold text-text-dark">4.9</span>
                                                    <span className="text-[10px] text-text-muted">(120)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-border-subtle flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            <span className="px-2.5 py-1 bg-secondary-bg rounded-lg text-[10px] font-bold text-text-muted whitespace-nowrap border border-transparent group-hover:border-border-subtle">Physics</span>
                                            <span className="px-2.5 py-1 bg-secondary-bg rounded-lg text-[10px] font-bold text-text-muted whitespace-nowrap border border-transparent group-hover:border-border-subtle">Calculus</span>
                                        </div>
                                    </div>

                                    {/* Writer Card 2 */}
                                    <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-card hover:shadow-soft transition-all cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className="size-14 rounded-2xl bg-cover bg-center shrink-0 border border-border-subtle" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDpxBE6-hC4tgvUvFPJl6mCzkih73YBSVP6fiEIxWsDK44BYfwBpX5E_Mb4JShbBSWdUpQzPm1Y6KVPfbmMy2wE-soipHdtWYPrB4cp3ZS8Kvtcjy6D_416tvxCoDXJSUL5k-YaCtTp2a2aIeNlCBYdxuR77-sPZzeepEdXBpLKwmQgHbjL1QX44qhowNfpQSzu8o3fRJ0pIMX4lmwWxvQMdPr5h83xPsQ1NpiNLl9PAcbzpR4ujKCwDXUpj1UXmXzZdL-_D0yl3hNj')" }}></div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-text-dark flex items-center gap-1">
                                                    Priya K.
                                                    <span className="material-symbols-outlined text-blue-500 text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                </h4>
                                                <p className="text-xs text-text-muted truncate">MBA Finance • Delhi University</p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    <span className="text-xs font-bold text-text-dark">5.0</span>
                                                    <span className="text-[10px] text-text-muted">(45)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-border-subtle flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                            <span className="px-2.5 py-1 bg-secondary-bg rounded-lg text-[10px] font-bold text-text-muted whitespace-nowrap border border-transparent group-hover:border-border-subtle">Finance</span>
                                            <span className="px-2.5 py-1 bg-secondary-bg rounded-lg text-[10px] font-bold text-text-muted whitespace-nowrap border border-transparent group-hover:border-border-subtle">Accounting</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Recent Chats Section */}
                                <div className="bg-white rounded-2xl border border-border-subtle shadow-card p-5">
                                    <h3 className="text-sm font-bold text-text-dark mb-4">Recent Chats</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/chats')}>
                                            <div className="size-10 rounded-full bg-cover bg-center shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIt2N00DgoPt0QAQPlXjfYki0ANVRAwu5cxO36QN3e03zY_X02wS786LBgrzCacPwCtINbJTRE8SfvgQdpYyBMWh2r2WhjgDSk0LyJBXLaBuSK-NIssTXW8HiWirXV74M3p2EHx3au4x4K9z9SjOplKfVm9-H-SMWfxO0nAJXPJCfd_c-n7u9TXps2hZhpaSjYu_nbDV2BM36VKM3mNSMFRZrli5Dg6KcAI_09eId8yq64wmvf9n2YteULYm9ed1Ky1LgDIGjOdmKU')" }}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p className="text-xs font-bold text-text-dark group-hover:text-primary transition-colors">Ananya S.</p>
                                                    <span className="text-[10px] text-text-muted">10:42 AM</span>
                                                </div>
                                                <p className="text-xs text-text-muted truncate">Draft uploaded. Check it out!</p>
                                            </div>
                                            <div className="size-2 bg-primary rounded-full"></div>
                                        </div>
                                        <div className="h-px bg-border-subtle"></div>
                                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/chats')}>
                                            <div className="size-10 rounded-full bg-cover bg-center shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4cpVqru6V_vRe5Bm7cdAB33R1FZcv8xVd-D31PopG-uZh2GBQCdjsJtG5KlXBpW-azklfmBiYM0JglpvDkAKbedz6GpHCO3qpGMbTJm1ySX6h6UvNKkDhpb6wW7sNz0O3d_QwW04N7edDiAgV_F6A2bGKqvfDE_fs_lfcB0mesuhb316BE_ZJ1MHfUCt1gP0GZ2k8MDKJZMk6P14PW7yT6i2V24-JeRpdAE8R3BWun8X9b6x4vhhqkg-5kLnHKOwD_dkyMdzLym2Z')" }}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p className="text-xs font-bold text-text-dark group-hover:text-primary transition-colors">Vikram R.</p>
                                                    <span className="text-[10px] text-text-muted">Yesterday</span>
                                                </div>
                                                <p className="text-xs text-text-muted truncate">Do you need visualization?</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/chats')} className="w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors">View All Messages</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};