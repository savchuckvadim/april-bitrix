import type { IBXContact } from '@workspace/bitrix';
import type { SupplyContact } from '../model/types';

/** Контакт Bitrix → то, что печатает отчёт (имя, должность, телефоны, комментарий). */
export const toSupplyContact = (contact: IBXContact): SupplyContact => ({
    ID: String(contact.ID ?? ''),
    NAME: [contact.LAST_NAME, contact.NAME, contact.SECOND_NAME].filter(Boolean).join(' ').trim(),
    LAST_NAME: contact.LAST_NAME ?? '',
    POST: contact.POST ?? '',
    COMMENTS: contact.COMMENTS ?? '',
    PHONE: (contact.PHONE ?? []).map(phone => phone.VALUE).filter(Boolean),
});

/** Контакт в легаси-форме bxContacts отчёта (карточка + поля ОРК; полей ОРК в новой модели нет). */
export const toReportContact = (contact: SupplyContact) => ({
    contact: {
        NAME: contact.NAME,
        POST: contact.POST,
        COMMENTS: contact.COMMENTS,
        PHONE: contact.PHONE.map(VALUE => ({ VALUE })),
    },
    fields: [] as never[],
});

/** Файл формы → base64 без data:-префикса (так его ждёт init-supply). */
export const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result ?? '');
            resolve(result.slice(result.indexOf(',') + 1));
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
