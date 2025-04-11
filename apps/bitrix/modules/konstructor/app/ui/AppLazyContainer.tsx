'use client'
import { lazy, Suspense } from 'react';

export const AppLazy = lazy(() => import('./App'));

const AppLazyContainer = ({ inBitrix }: { inBitrix: boolean }) => {
    debugger
   return <Suspense>
        <AppLazy inBitrix={inBitrix} />
    </Suspense>

}

export default AppLazyContainer