import React from 'react';
import { ProfileBuilder } from '../components/ProfileBuilder';

export const Onboarding = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center">
            <div className="text-center mb-10 max-w-2xl animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    Let's Build Your <span className="text-orange-500">Profile</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    We'll ask you a few quick questions to help others understand your skills and interests.
                    No grades, no pressure—just you.
                </p>
            </div>

            <div className="w-full animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <ProfileBuilder />
            </div>
        </div>
    );
};
