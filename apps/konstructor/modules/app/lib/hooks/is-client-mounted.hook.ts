'use client';
import { useEffect, useState } from 'react';

export const useIsClientMounted = (): boolean => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
};
