import React from 'react';
import { cn } from '../../utils/cn'; // Assuming we'll create a cn utility or use clsx directly if preferred, but let's stick to standard patterns. 
// Actually, I should check if they have a utils folder. If not, I'll create one.
// For now, I'll implement a simple class joiner or use template literals if I don't want to add dependencies yet, 
// but `clsx` and `tailwind-merge` are standard. I'll check package.json again. 
// They don't have clsx or tailwind-merge in package.json. I should add them or just use template literals for now to avoid extra deps if not requested, 
// but for a "premium" design system, `cn` is very helpful. 
// I'll add clsx and tailwind-merge.

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    disabled,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

    const variants = {
        primary: "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-500/50 border-none",
        secondary: "glass hover:bg-white/20 text-slate-800 dark:text-white border-white/20",
        ghost: "hover:bg-white/10 text-slate-700 dark:text-slate-200",
        outline: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30"
    };

    const sizes = {
        sm: "px-4 py-1.5 text-sm",
        md: "px-6 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && icon && <span className="mr-2">{icon}</span>}
            {children}

            {/* Shine effect for primary buttons */}
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
        </button>
    );
};
