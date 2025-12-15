import React from 'react';
import { cn } from '../../utils/cn';

interface GlassLayoutProps {
    children: React.ReactNode;
    className?: string;
    showBlobs?: boolean;
}

export const GlassLayout: React.FC<GlassLayoutProps> = ({
    children,
    className,
    showBlobs = true
}) => {
    return (
        <div className="min-h-screen w-full relative overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Background Blobs */}
            {showBlobs && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[100px] animate-float-slow" />
                    {/* Blue blob removed as per user request */}
                    <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] rounded-full bg-purple-500/20 blur-[100px] animate-float-slow" style={{ animationDelay: '2s' }} />
                </div>
            )}

            {/* Content */}
            <div className={cn("relative z-10", className)}>
                {children}
            </div>
        </div>
    );
};
