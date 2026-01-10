import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Onboarding = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/feed');
    }, [navigate]);
    return null;
};
