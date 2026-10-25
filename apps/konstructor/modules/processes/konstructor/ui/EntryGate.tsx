'use client';

import { DatabaseZap } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { EmptyState, Spinner } from '@workspace/april-ui/feedback';
import { useEntryGate } from '../hooks/use-entry-gate';

/**
 * Экран входа `/`: пока решается, куда вести (слепок, варианты КП), —
 * спиннер под шапкой; каталог не загрузился — честная ошибка с повтором.
 */
export const EntryGate = () => {
    const gate = useEntryGate();

    if (gate.isCatalogFailed) {
        return (
            <EmptyState
                icon={DatabaseZap}
                tone="destructive"
                title="Каталог не загрузился"
                description="Без комплектов и цен конструктор не может открыть сделку. Попробуйте обновить приложение."
                actions={<Button onClick={gate.reload}>Обновить</Button>}
            />
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-muted-foreground">
            <Spinner size="lg" label="Открываем сделку" />
            Открываем сделку…
        </div>
    );
};
