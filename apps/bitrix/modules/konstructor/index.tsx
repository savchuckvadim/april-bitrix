// import ('./bootstrap');
// export {}

// export { App as KonstructorApp } from '@/modules/konstructor/app'
// export { KonstructorAppPage as KonstructorApp } from './pages'

'use client'
import React from 'react';
import AppLazyContainer from './app/ui/AppLazyContainer';
import { useIsClient } from './app/lib/hooks/useIsClient';
import { PageLoaderWrapper } from '../general';

// import dynamic from 'next/dynamic'
// import App from '@konstructor/app/ui/App';

// const App = dynamic(() => import('@konstructor/app/ui/App'), { ssr: false })


const KonstructorPage: React.FC<{ inBitrix: boolean }> = ({ inBitrix }) => {
    debugger
    console.log('KonstructorPage')
    console.log(inBitrix)
    const isClient = useIsClient()

    if (!isClient) return  <PageLoaderWrapper  /> // или <PageLoader />
    return (
        <AppLazyContainer inBitrix={inBitrix} />

    );
}

export default KonstructorPage;