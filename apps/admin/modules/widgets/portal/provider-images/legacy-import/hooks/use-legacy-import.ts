'use client';

import { useState } from 'react';
import {
    PROVIDER_IMAGE_LEGACY_TEXT,
    checkLegacyImportSelection,
    hasLegacyImportWork,
    providerImageErrorMessage,
    selectLegacyImportFiles,
    useProviderImageLegacyImport,
    type LegacyImportSelection,
    type ProviderImageLegacyImportReport,
} from '@/modules/entities/portal-provider/provider-image';

/**
 * Состояние диалога переноса: выбранная папка, отчёт последнего ответа бэка и
 * доступность кнопок. Отчёт и сообщение об успехе берутся только из ответа
 * сервера. «Перенести» включается после проверки, в которой есть что переносить;
 * новый выбор папки сбрасывает отчёт, и перенос снова требует проверки.
 * Пока запрос идёт, диалог не закрывается; при закрытии состояние очищается.
 */
export function useLegacyImport(onOpenChange: (open: boolean) => void) {
    const mutation = useProviderImageLegacyImport();
    const [selection, setSelection] = useState<LegacyImportSelection | null>(null);
    const [report, setReport] = useState<ProviderImageLegacyImportReport | null>(null);

    const isSending = mutation.isPending;
    const selectionError = selection ? checkLegacyImportSelection(selection) : null;
    const canCheck = selection !== null && selectionError === null && !isSending;

    const reset = (): void => {
        setSelection(null);
        setReport(null);
        mutation.reset();
    };

    const send = (dryRun: boolean): void => {
        if (!selection || !canCheck) return;
        mutation.mutate({ files: selection.files, dryRun }, { onSuccess: (data) => setReport(data) });
    };

    return {
        selection,
        selectionError,
        report,
        isSending,
        /** Какой запрос сейчас идёт: true проверка, false перенос, null ничего */
        sendingDryRun: isSending ? (mutation.variables?.dryRun ?? null) : null,
        errorMessage: mutation.isError
            ? providerImageErrorMessage(mutation.error, PROVIDER_IMAGE_LEGACY_TEXT.requestError)
            : null,
        canCheck,
        canRun: canCheck && hasLegacyImportWork(report),
        pickFiles: (picked: ArrayLike<File>): void => {
            setSelection(selectLegacyImportFiles(picked));
            setReport(null);
            mutation.reset();
        },
        check: () => send(true),
        run: () => send(false),
        changeOpen: (next: boolean): void => {
            if (isSending) return;
            if (!next) reset();
            onOpenChange(next);
        },
    };
}
