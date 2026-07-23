'use client';

import dynamic from 'next/dynamic';

const Orb = dynamic(() => import('@workspace/ui/components/Orb'), {
    ssr: false,
});

/** WebGL-орб (ReactBits) на фоне контента прелоадера. */
export const PreloaderOrbBg = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[420px] w-[420px] max-h-[80vmin] max-w-[80vmin]">
            <Orb hoverIntensity={0.3} rotateOnHover forceHoverState />
        </div>
    </div>
);
