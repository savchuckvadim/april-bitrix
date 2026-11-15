'use client';

import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { OfferLetterImportTable } from '../offer-letter-import-table/OfferLetterImportTable';
import { useOfferLettersImportView } from './hooks/use-offer-letters-import-view';

/**
 * Письма КП: перенос письма каждого портала из легаси-шаблона `offer` в
 * новую таблицу писем. Временный экран — после переноса уберётся, а здесь
 * появится редактирование писем.
 */
export function OfferLettersImport() {
    const view = useOfferLettersImportView();

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Письма КП</h1>

            <p className="max-w-3xl text-sm text-muted-foreground">
                Письмо портала берётся из старого шаблона КП (поле «Текст письма») и
                становится письмом портала по умолчанию в новом конструкторе. Сначала
                проверьте, что будет перенесено. Повторный перенос безопасен: уже
                перенесённые письма не дублируются.
            </p>

            <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={view.isPending} onClick={view.check}>
                    Проверить
                </Button>
                <Button disabled={view.isPending} onClick={() => view.setConfirmOpen(true)}>
                    Перенести письма
                </Button>
            </div>

            {view.isError ? (
                <p className="text-sm text-destructive">Ручка переноса ответила ошибкой.</p>
            ) : null}
            {view.summary ? <p className="text-sm">{view.summary}</p> : null}
            {view.summary ? <OfferLetterImportTable data={view.items} /> : null}

            <ConfirmDialog
                open={view.isConfirmOpen}
                onOpenChange={view.setConfirmOpen}
                title="Перенести письма?"
                description="Письма порталов будут записаны в новую таблицу. Легаси-шаблоны не меняются."
                onConfirm={view.run}
                confirmLabel="Перенести"
                isLoading={view.isPending}
            />
        </div>
    );
}
