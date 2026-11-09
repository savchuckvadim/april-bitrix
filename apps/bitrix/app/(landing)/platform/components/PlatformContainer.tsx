import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface PlatformContainerProps {
    className?: string;
    children: ReactNode;
}

/**
 * Общая ширина колонки раздела: шапка, секции и подвал выровнены по ней.
 * Широкая — 1440px, с полями 16px на телефоне и 32px от планшета. В
 * пикселях, а не в rem: корень сайта — 14px (плотность из токенов темы), и
 * rem-ширина выходила бы на восьмую часть уже задуманной.
 */
export function PlatformContainer({ className, children }: PlatformContainerProps) {
    return <div className={cn('mx-auto w-full max-w-[1440px] px-4 md:px-8', className)}>{children}</div>;
}
