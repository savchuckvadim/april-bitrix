'use client';

import dynamic from 'next/dynamic';

const Aurora = dynamic(() => import('@workspace/ui/components/Aurora'), {
    ssr: false,
});

/** Северное сияние (ReactBits) во весь фон прелоадера. */
export const PreloaderAuroraBg = () => (
    <div className="absolute inset-0">
        <Aurora amplitude={1.2} blend={0.6} />
    </div>
);
