'use client';

import dynamic from 'next/dynamic';

const LiquidEther = dynamic(
    () => import('@workspace/ui/components/LiquidEther'),
    { ssr: false },
);

/** «Жидкий эфир» (ReactBits) — самый эффектный и самый тяжёлый вариант. */
export const PreloaderLiquidBg = () => (
    <div className="absolute inset-0">
        <LiquidEther />
    </div>
);
