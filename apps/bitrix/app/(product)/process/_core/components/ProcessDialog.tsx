'use client';

import type { FC, ReactNode } from 'react';
import { GlassDialog as GlassDialogShell } from '@workspace/april-ui';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';

export interface ProcessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    /** Ширина окна: подпроцессы бывают широкими. */
    size?: 'md' | 'lg';
    children: ReactNode;
}

/**
 * Модалка подпроцесса — единственная точка создания окон на странице.
 *
 * Стеклянную оболочку даёт дизайн-система (GlassDialog из april-ui), здесь
 * только шапка в едином для страницы виде и прокручиваемое тело. Раз все окна
 * процесса проходят через один компонент, бюджет «жидкого стекла» (один
 * SVG-фильтр на экземпляр, только Chromium) не расползается по странице.
 */
export const ProcessDialog: FC<ProcessDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    size = 'lg',
    children,
}) => (
    <GlassDialogShell
        open={open}
        onOpenChange={onOpenChange}
        size={size === 'lg' ? 'lg' : 'sm'}
        className="max-h-[88vh]"
        cardClassName="max-h-[88vh] overflow-hidden rounded-2xl p-5 sm:p-6"
    >
        <DialogHeader className="shrink-0 text-left">
            <DialogTitle className="text-xl font-bold text-balance">
                {title}
            </DialogTitle>
            {description && (
                <DialogDescription className="text-muted-foreground">
                    {description}
                </DialogDescription>
            )}
        </DialogHeader>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {children}
        </div>
    </GlassDialogShell>
);
