'use client';

import { FC } from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import { Spinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { JOIN_TO_MAIN_TEXT } from '../../../lib/join-to-main.util';
import type { useDuplicateDetails } from '../../../lib/hooks';

interface JoinToMainActionProps {
    view: ReturnType<typeof useDuplicateDetails>;
}

/**
 * «Присоединить сюда» — только руководителю и только из сделки.
 *
 * Два шага: кнопка взводит подтверждение с описанием последствий, второй
 * клик запускает хук. Ничего не удаляется, но текущая сделка закрывается
 * стадией «Дубль» — поэтому без подтверждения нельзя. После успеха —
 * ссылка на основную и кнопка обновить приложение: текущая сделка больше
 * не рабочая, фрейм должен это увидеть.
 */
export const JoinToMainAction: FC<JoinToMainActionProps> = ({ view }) => {
    const { join } = view;
    if (!join.canJoin) return null;

    if (join.isLoading) {
        return (
            <div className="flex items-center gap-2 rounded-md border border-border p-2 text-sm text-muted-foreground">
                <Spinner /> {JOIN_TO_MAIN_TEXT.working}
            </div>
        );
    }

    if (join.isReady && join.result) {
        const { result } = join;
        const facts = [
            result.contactsLinked ? `контактов: ${result.contactsLinked}` : null,
            result.leadsRelinked ? `лидов: ${result.leadsRelinked}` : null,
            result.tasksMoved ? `задач: ${result.tasksMoved}` : null,
            result.activitiesMoved ? `дел: ${result.activitiesMoved}` : null,
        ].filter(Boolean);
        return (
            <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-2">
                <p className="text-sm font-semibold text-foreground">
                    {result.mainDealId
                        ? `Присоединено к сделке ${result.mainDealId}`
                        : 'Компания привязана, текущая сделка осталась основной'}
                </p>
                {facts.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {facts.join(', ')}
                        {result.closedAsDuplicate
                            ? '; текущая сделка закрыта как «Дубль»'
                            : ''}
                    </p>
                )}
                {result.warnings.length > 0 && (
                    <p className="text-xs text-warning">
                        {result.warnings.join('; ')}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    {join.mainDealUrl && (
                        <a
                            href={join.mainDealUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-2"
                        >
                            {JOIN_TO_MAIN_TEXT.openMain}
                            <ExternalLink aria-hidden className="size-3.5" />
                        </a>
                    )}
                    <Button size="sm" variant="outline" onClick={join.reload}>
                        {JOIN_TO_MAIN_TEXT.reload}
                    </Button>
                </div>
            </div>
        );
    }

    if (join.isArmed) {
        return (
            <div className="space-y-2 rounded-md border border-warning/50 bg-warning/5 p-2">
                <p className="text-sm font-semibold text-foreground">
                    {JOIN_TO_MAIN_TEXT.confirmTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                    {join.confirmText}
                </p>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={join.confirm}>
                        {JOIN_TO_MAIN_TEXT.confirm}
                    </Button>
                    <Button size="sm" variant="outline" onClick={join.disarm}>
                        {JOIN_TO_MAIN_TEXT.cancel}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            {join.isError && join.error && (
                <p className="text-xs text-destructive">{join.error}</p>
            )}
            <Button size="sm" variant="secondary" onClick={join.arm}>
                <Link2 aria-hidden className="size-3.5" />
                {join.isError ? JOIN_TO_MAIN_TEXT.retry : JOIN_TO_MAIN_TEXT.button}
            </Button>
        </div>
    );
};
