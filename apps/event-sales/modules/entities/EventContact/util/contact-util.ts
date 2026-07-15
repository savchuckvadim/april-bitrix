import { EV_CONTACT_PROP } from '../type/event-contact-type';

export const validateInput = (value: string, prop: EV_CONTACT_PROP): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (prop === EV_CONTACT_PROP.EMAIL && !emailRegex.test(value)) {
        return 'Некорректный email';
    }
    if (prop === EV_CONTACT_PROP.PHONE && !phoneRegex.test(value)) {
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
