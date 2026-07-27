'use client';

import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
    PROCESSING_TEXTS,
    TITLE_GRADIENT,
} from '../../lib/processing-fx';

const GradientText = dynamic(
    () => import('@workspace/ui/components/GradientText'),
    { ssr: false },
);

interface ProcessingHeroProps {
    /** Градиентный заголовок; false — обычный text-foreground. */
    gradientTitle?: boolean;
    /** Слот таймера под текстами. */
    children?: React.ReactNode;
}

/**
 * Центр Processing-экрана: та же картинка конструирования отчёта
 * (/cover/coming-soon.svg) + тексты + слот таймера. Переиспользуется
 * всеми альтернативными вариантами страницы.
 */
export const ProcessingHero = ({
    gradientTitle = false,
    children,
}: ProcessingHeroProps) => {
    const title = (
        <h4 className="text-foreground mt-6 text-xl font-semibold">
            {PROCESSING_TEXTS.title}
        </h4>
    );

    return (
        <div className="w-full max-w-sm text-center">
            <div className="mb-6 flex justify-center">
                <Image
                    src="/cover/coming-soon.svg"
                    alt="processing"
                    priority
                    className="h-auto w-full"
                    width={100}
                    height={100}
                />
            </div>

            {gradientTitle ? (
                <GradientText colors={TITLE_GRADIENT} animationSpeed={6}>
                    {title}
                </GradientText>
            ) : (
                title
            )}
            <p className="text-muted-foreground mt-2 text-sm">
                {PROCESSING_TEXTS.subtitle}
            </p>

            <div className="mt-10 flex w-full items-center justify-center">
                {children}
            </div>
        </div>
    );
};
