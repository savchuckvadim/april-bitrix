'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { PreloaderMinimal } from './variants/PreloaderMinimal';
import { PreloaderOrbBg } from './variants/PreloaderOrbBg';
import { PreloaderAuroraBg } from './variants/PreloaderAuroraBg';
import { PreloaderLiquidBg } from './variants/PreloaderLiquidBg';
import { PreloaderBrandContent } from './variants/PreloaderBrandContent';

const GradientText = dynamic(
    () => import('@workspace/ui/components/GradientText'),
    { ssr: false },
);

export type PreloaderVariant =
    | 'minimal'
    | 'brand'
    | 'orb'
    | 'aurora'
    | 'liquid';

interface PreloaderScreenProps {
    /**
     * minimal/brand — быстрые CSS-only (brand — крупный логотип в кольцах
     * с прогрессом); orb/aurora/liquid — ReactBits WebGL.
     */
    variant?: PreloaderVariant;
    title?: string;
    /** null — без лого. */
    logoSrc?: string | null;
    /** Градиент заголовка (fx-акцент; при null — обычный text-foreground). */
    gradientColors?: string[] | null;
}

const BACKGROUNDS: Record<PreloaderVariant, () => React.ReactNode> = {
    minimal: () => <PreloaderMinimal />,
    brand: () => <PreloaderMinimal />,
    orb: () => <PreloaderOrbBg />,
    aurora: () => <PreloaderAuroraBg />,
    liquid: () => <PreloaderLiquidBg />,
};

const DEFAULT_GRADIENT = ['#bb52d4', '#30c3ef', '#bb52d4', '#30c3ef'];

/**
 * Единый полноэкранный прелоадер монорепы (заменяет app-локальные
 * LoadingScreen). Вариант фона выбирается пропом; тяжёлые эффекты
 * подгружаются лениво и не блокируют первый рендер.
 */
export const PreloaderScreen = ({
    variant = 'minimal',
    title = 'Апрель',
    logoSrc = '/logo/logo.svg',
    gradientColors = DEFAULT_GRADIENT,
}: PreloaderScreenProps) => {
    const titleNode = (
        <p className="mt-2 text-md font-semibold tracking-widest text-foreground">
            {title}
        </p>
    );

    if (variant === 'brand') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
                {BACKGROUNDS[variant]()}
                <PreloaderBrandContent title={title} logoSrc={logoSrc} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
            {BACKGROUNDS[variant]()}

            <div className="relative z-10 flex flex-col items-center">
                {logoSrc && (
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <Image
                            src={logoSrc}
                            alt={title}
                            width={45}
                            height={45}
                            priority
                        />
                    </div>
                )}
                {gradientColors ? (
                    <GradientText colors={gradientColors}>
                        {titleNode}
                    </GradientText>
                ) : (
                    titleNode
                )}
            </div>
        </div>
    );
};
