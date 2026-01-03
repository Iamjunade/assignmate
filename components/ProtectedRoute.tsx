import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Helper function to check if profile has all required fields
const isProfileComplete = (user: any): boolean => {
    if (!user) return false;

    // Required fields that must have valid values
    const hasFullName = user.full_name && user.full_name !== 'Student' && user.full_name.trim().length >= 2;
    const hasHandle = user.handle && user.handle.length >= 3;
    const hasSchool = user.school && user.school !== 'Not Specified' && user.school.trim().length > 0;

    return hasFullName && hasHandle && hasSchool && !user.is_incomplete;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-orange-600 gap-3">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Check if profile is incomplete OR missing required fields
    if (!isProfileComplete(user)) {
        // Don't redirect if already on onboarding page
        if (location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return <>{children}</>;
};
