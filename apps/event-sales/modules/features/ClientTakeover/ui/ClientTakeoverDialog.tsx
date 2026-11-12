'use client';

import { FC } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { describeTakeover } from '../lib/client-takeover-view';
import {
    closeClientTakeover,
    confirmClientTakeover,
} from '../model/ClientTakeoverThunk';

const Section: FC<{ title: string; lines: string[] }> = ({ title, lines }) =>
    lines.length ? (
        <div className="space-y-1">
            <p className="text-sm font-medium">{title}</p>
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {lines.map(line => (
                    <li key={line}>{line}</li>
                ))}
            </ul>
        </div>
    ) : null;

/**
 * «Забрать работу коллег себе?» — перед отправкой отчёта, когда на портале
 * включены перехват всей работы и подтверждение, а у клиента есть открытая
 * работа других сотрудников. «Не забирать» — отчёт уйдёт как раньше:
 * своя сделка, чужое не трогается.
 */
export const ClientTakeoverDialog: FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, preview } = useAppSelector(s => s.clientTakeover);

    if (!isOpen || !preview) return null;
    const view = describeTakeover(preview);

    return (
        <GlassDialog
            open={isOpen}
            onOpenChange={open => !open && dispatch(closeClientTakeover())}
            size="sm"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>Забрать работу коллег себе?</DialogTitle>
                <DialogDescription>
                    У клиента открыта работа других сотрудников. Если забрать —
                    она перейдёт к вам или закроется.
                </DialogDescription>
            </DialogHeader>

            <Section
                title="Перейдёт к вам"
                lines={view.taken ? [view.taken] : []}
            />
            <Section title="Закроется" lines={view.closes} />
            <Section
                title="Не тронется — поздняя стадия, договоритесь с коллегой"
                lines={view.kept}
            />

            <div className="flex flex-wrap justify-end gap-2">
                <Button
                    variant="ghost"
                    onClick={() => dispatch(closeClientTakeover())}
                >
                    Отмена
                </Button>
                <Button
                    variant="outline"
                    onClick={() => dispatch(confirmClientTakeover(false))}
                >
                    Не забирать
                </Button>
                <Button onClick={() => dispatch(confirmClientTakeover(true))}>
                    Забрать себе
                </Button>
            </div>
        </GlassDialog>
    );
};

export default ClientTakeoverDialog;
