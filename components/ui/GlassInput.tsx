import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || React.useId();

    return (
        <div className="w-full space-y-1">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl 
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            outline-none transition-all duration-200
            focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10
            placeholder:text-slate-400 text-slate-900 dark:text-white
            disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 ml-1 animate-slide-down">{error}</p>
            )}
        </div>
    );
};
