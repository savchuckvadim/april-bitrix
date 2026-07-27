import React from 'react';
import { cn } from '@workspace/ui/lib/utils';

type AwardTone = 'success' | 'destructive';

interface AwardBadgeProps {
    icon: React.ReactNode;
    tone: AwardTone;
    children: React.ReactNode;
    /** Приглушённый хвост (например «1 из 18»). */
    suffix?: React.ReactNode;
}

const TONE_CLASS: Record<AwardTone, string> = {
    success: 'border-success/40 bg-success/10 text-success',
    destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
};

const SUFFIX_CLASS: Record<AwardTone, string> = {
    success: 'text-success/70',
    destructive: 'text-destructive/70',
};

/** Бейдж награды рядом с именем: иконка + текст + опциональный хвост. */
export const AwardBadge: React.FC<AwardBadgeProps> = ({
    icon,
    tone,
    children,
    suffix,
}) => (
    <span
        className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
            TONE_CLASS[tone],
        )}
    >
        {icon}
        <span>{children}</span>
        {suffix !== undefined && (
            <span className={SUFFIX_CLASS[tone]}>{suffix}</span>
        )}
    </span>
);
