import React, { useEffect, useState } from 'react';

interface PreloaderProps {
    phrase?: string;
}

export const PreloaderMicro: React.FC<PreloaderProps> = ({ phrase }) => {
    const [dots, setDots] = useState<string>('.');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + '.' : '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return <p className="text-sm text-muted-foreground">{phrase ? phrase : dots}</p>;
};
