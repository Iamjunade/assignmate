import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'dark' | 'neon';
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'default',
    hoverEffect = false,
    ...props
}) => {
    const baseStyles = "rounded-2xl backdrop-blur-md transition-all duration-300 border";

    const variants = {
        default: "bg-white/10 border-white/20 shadow-glass",
        dark: "bg-black/40 border-white/10 shadow-glass text-white",
        neon: "bg-slate-900/80 border-orange-500/50 shadow-neon"
    };

    const hoverStyles = hoverEffect ? "hover:-translate-y-1 hover:shadow-glass-lg hover:bg-white/15" : "";

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
