import { OFFER_LETTER_IMPORT_STATUS, type OfferLettersImportResponse } from '../model';

/** Итог запуска одной строкой */
export const offerLettersImportSummary = (result: OfferLettersImportResponse): string => {
    const total = result.items.length;
    if (!total) return 'Писем в легаси-шаблонах не найдено.';
    if (result.dryRun) {
        const planned = result.items.filter(
            item => item.status === OFFER_LETTER_IMPORT_STATUS.WOULD_CREATE,
        ).length;
        return `Проверка: найдено писем — ${total}, будет перенесено — ${planned}. Ничего не записано.`;
    }
    return `Перенос: найдено писем — ${total}, перенесено — ${result.created}.`;
};

export const yesNo = (value: boolean): string => (value ? 'Да' : 'Нет');
