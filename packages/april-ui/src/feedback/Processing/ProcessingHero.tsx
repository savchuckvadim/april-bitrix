'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { PROCESSING_TEXTS, TITLE_GRADIENT } from './processing-fx';

const GradientText = dynamic(
    () => import('@workspace/ui/components/GradientText'),
    { ssr: false },
);

export interface ProcessingHeroProps {
    /** Градиентный заголовок; false — обычный text-foreground. */
    gradientTitle?: boolean;
    /** Палитра градиентного заголовка. */
    titleGradient?: string[];
    title?: string;
    subtitle?: string;
    /** Картинка «конструируем отчёт» — путь в public приложения. */
    imageSrc?: string;
    /** Слот таймера под текстами. */
    children?: ReactNode;
}

/**
 * Центр Processing-экрана: картинка конструирования отчёта + тексты + слот
 * таймера. Переиспользуется всеми вариантами страницы во всех приложениях.
 */
export const ProcessingHero = ({
    gradientTitle = false,
    titleGradient = TITLE_GRADIENT,
    title = PROCESSING_TEXTS.title,
    subtitle = PROCESSING_TEXTS.subtitle,
    imageSrc = '/cover/coming-soon.svg',
    children,
}: ProcessingHeroProps) => {
    const heading = (
        <h4 className="mt-6 text-xl font-semibold text-foreground">{title}</h4>
    );

    return (
        <div className="w-full max-w-sm text-center">
            <div className="mb-6 flex justify-center">
                <Image
                    src={imageSrc}
                    alt=""
                    aria-hidden
                    priority
                    className="h-auto w-full"
                    width={100}
                    height={100}
                />
            </div>

            {gradientTitle ? (
                <GradientText colors={titleGradient} animationSpeed={6}>
                    {heading}
                </GradientText>
            ) : (
                heading
            )}
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-10 flex w-full items-center justify-center">
                {children}
            </div>
        </div>
    );
};
