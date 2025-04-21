
'use client'
import React from 'react';
import AppLazyContainer from './app/ui/AppLazyContainer';
import { useIsClient } from './app/lib/hooks/useIsClient';
import { LoadingScreen } from '../general';


const KonstructorPage: React.FC<{ inBitrix: boolean }> = ({ inBitrix }) => {

    console.log('KonstructorPage')
    console.log(inBitrix)
    const isClient = useIsClient()

    if (!isClient) return <LoadingScreen /> // или <PageLoader />
    return (
        <AppLazyContainer inBitrix={inBitrix} />

    );
}

export default KonstructorPage;