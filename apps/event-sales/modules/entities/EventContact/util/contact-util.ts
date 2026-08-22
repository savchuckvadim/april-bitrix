import { EV_CONTACT_PROP } from '../type/event-contact-type';

/**
 * Телефон без разделителей: пробелы, скобки и дефисы к номеру отношения не
 * имеют. Раньше проверка ругалась на формат из СОБСТВЕННОГО плейсхолдера
 * («+7 900 000-00-00»), и контакт просто не создавался.
 */
export const normalizePhone = (value: string): string =>
    value.replace(/[\s()\-.]/g, '');

export const validateInput = (value: string, prop: EV_CONTACT_PROP): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (prop === EV_CONTACT_PROP.EMAIL && !emailRegex.test(value.trim())) {
        return 'Некорректный email';
    }
    if (
        prop === EV_CONTACT_PROP.PHONE &&
        !phoneRegex.test(normalizePhone(value))
    ) {
        return 'Некорректный телефон';
    }
    return '';
};

export const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
};
