'use client';

import { useEffect, useState } from 'react';

export const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;
    return (
        <div className="h-screen w-screen bg-background">
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        </div>
    );
}