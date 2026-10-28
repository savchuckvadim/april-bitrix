'use client';

import { FC } from 'react';
import { VenetianMask } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useImpersonation } from '../lib/hooks/use-impersonation';
import { IMPERSONATION_TEXT as TEXT } from '../lib/impersonation-texts';

interface ImpersonationBannerProps {
    /** После возврата к себе (обычно — на список дел). */
    onSwitched?: () => void;
}

/**
 * Полоса «вы работаете как сотрудник» — пока режим включён. Суперпользователь
 * должен видеть, от чьего имени уйдёт каждое действие, и выйти одним нажатием.
 */
export const ImpersonationBanner: FC<ImpersonationBannerProps> = ({
    onSwitched,
}) => {
    const { targetName, stop } = useImpersonation(onSwitched);

    if (!targetName) return null;

    return (
        <div
            role="status"
            className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs"
        >
            <VenetianMask
                aria-hidden
                className="size-3.5 shrink-0 text-destructive"
            />
            <span className="min-w-0 flex-1">
                {TEXT.bannerPrefix}{' '}
                <span className="font-medium">{targetName}</span>.{' '}
                <span className="text-muted-foreground">
                    {TEXT.bannerNote}
                </span>
            </span>
            <Button
                size="sm"
                variant="outline"
                className="h-6 shrink-0 px-2 text-xs"
                onClick={() => void stop()}
            >
                {TEXT.stop}
            </Button>
        </div>
    );
};
