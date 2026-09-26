'use client';

import { CheckCircle2, TriangleAlert } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import type { AiSettingsSaveSummary } from '../../lib/ai-settings-form.payload';

interface AiSettingsSummaryProps {
    summary: AiSettingsSaveSummary;
}

const List = ({ items }: { items: string[] }) => (
    <ul className="list-disc space-y-0.5 pl-4">
        {items.map(item => (
            <li key={item}>{item}</li>
        ))}
    </ul>
);

/** Сводка после сохранения: что записано, сравнимая история, предупреждения. */
export const AiSettingsSummary = ({ summary }: AiSettingsSummaryProps) => (
    <div className="space-y-3 text-sm">
        <div>
            <p className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Сохранено
            </p>
            <div className="mt-1 text-xs text-muted-foreground">
                {summary.saved.length > 0 ? (
                    <List items={summary.saved} />
                ) : (
                    'Изменений не было'
                )}
            </div>
        </div>

        {summary.breaks.length > 0 ? (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>
                    Начало сравнимой истории сдвинуто на{' '}
                    {summary.comparableFrom || 'сегодня'}
                </AlertTitle>
                <AlertDescription className="text-xs">
                    <p>Тренды до этой даты несопоставимы с новыми. Сдвинули:</p>
                    <List items={summary.breaks} />
                </AlertDescription>
            </Alert>
        ) : (
            <p className="text-xs text-muted-foreground">
                Сравнимая история не изменилась
                {summary.comparableFrom
                    ? ` — по-прежнему с ${summary.comparableFrom}.`
                    : ' — ряды ни разу не рвались настройками.'}
            </p>
        )}

        {summary.warnings.length > 0 && (
            <div>
                <p className="text-xs font-medium">Предупреждения</p>
                <div className="mt-1 text-xs text-muted-foreground">
                    <List items={summary.warnings} />
                </div>
            </div>
        )}

        <p className="text-xs text-muted-foreground">
            Сброшено ключей кэша: {summary.resetCount} — обзор и «Внимание»
            пересчитываются.
        </p>
    </div>
);
