'use client';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';

export interface InvoiceTemplatesNoticesProps {
    hasPortal: boolean;
    /** Ошибка загрузки списка; нет ошибки, значит `null`. */
    loadError: string | null;
    onRetry: () => void;
}

/** Предупреждения над списком: нет портала и неудачная загрузка. */
export const InvoiceTemplatesNotices = ({
    hasPortal,
    loadError,
    onRetry,
}: InvoiceTemplatesNoticesProps) => (
    <>
        {hasPortal ? null : (
            <Alert>
                <AlertDescription>
                    Портал не определён: видны только общие шаблоны, шаблоны портала и
                    поставщиков добавить нельзя.
                </AlertDescription>
            </Alert>
        )}
        {loadError ? (
            <Alert variant="destructive" className="flex items-center justify-between gap-3">
                <AlertDescription>{loadError}</AlertDescription>
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Повторить
                </Button>
            </Alert>
        ) : null}
    </>
);
