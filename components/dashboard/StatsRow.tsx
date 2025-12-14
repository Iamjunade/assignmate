import React from 'react';

export const StatsRow: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="bg-orange-50 p-2 rounded-full text-primary">
                        <span className="material-symbols-outlined">assignment_late</span>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+1 New</span>
                </div>
                <div>
                    <p className="text-text-muted text-sm font-medium mb-1">Active Projects</p>
                    <h3 className="text-3xl font-bold text-text-dark">2</h3>
                </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="bg-orange-50 p-2 rounded-full text-primary">
                        <span className="material-symbols-outlined">shield_lock</span>
                    </div>
                    <span className="bg-gray-100 text-text-muted text-xs font-bold px-2 py-1 rounded-full">Locked</span>
                </div>
                <div>
                    <p className="text-text-muted text-sm font-medium mb-1">Escrow Balance (Secure)</p>
                    <h3 className="text-3xl font-bold text-text-dark">₹1,500</h3>
                </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="bg-orange-50 p-2 rounded-full text-primary">
                        <span className="material-symbols-outlined">timer</span>
                    </div>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Urgent</span>
                </div>
                <div>
                    <p className="text-text-muted text-sm font-medium mb-1">Upcoming Deadline</p>
                    <h3 className="text-3xl font-bold text-text-dark">2 Days</h3>
                </div>
            </div>
        </div>
    );
};
