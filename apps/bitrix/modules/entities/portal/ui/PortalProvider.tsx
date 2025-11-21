'use client';
import React from 'react';
import { usePortal } from '../lib/hooks';
import { useRouter } from 'next/navigation';
import { PortalAdd } from './PortalAdd/PortalAdd';

export const PortalProvider = ({

    children
}: {
    children: React.ReactNode
}) => {
    const { portals, selectedPortal, isLoading, error } = usePortal();
    const router = useRouter();
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!selectedPortal) {
        return <div className="min-h-screen flex items-start justify-center pt-20">
            <div className="max-w-md w-full">
                <PortalAdd />
            </div>

        </div>;
    }
    return <div className="min-h-screen bg-card">
        <div className="px-10 mx-auto ">
            портал: <span className="text-primary">{selectedPortal?.domain}</span>
        </div>
        {children}
    </div>;
};
