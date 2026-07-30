import {
    VENDOR_EMAIL,
    VENDOR_INN,
    VENDOR_PHONE,
    VENDOR_PHONE_HREF,
    VENDOR_SHORT_NAME,
} from '../../legal/constants/vendor';

export interface SupportChannel {
    /** Тип канала: email, телефон, сайт */
    kind: 'email' | 'phone' | 'site';
    /** Отображаемое значение */
    label: string;
    /** href для ссылки */
    href: string;
}

export const SUPPORT_TITLE = 'Поддержка приложения «Менеджер Гарант»';

export const SUPPORT_SUBTITLE =
    'Поможем с установкой, подключением и работой продуктов: Звонки, Конструктор КП, Отчёт ОП KPI.';

export const SUPPORT_CHANNELS: SupportChannel[] = [
    {
        kind: 'email',
        label: VENDOR_EMAIL,
        href: `mailto:${VENDOR_EMAIL}`,
    },
    {
        kind: 'phone',
        label: VENDOR_PHONE,
        href: VENDOR_PHONE_HREF,
    },
];

export const SUPPORT_SCHEDULE = 'Режим работы: пн–пт, 9:00–18:00 (МСК).';

export const SUPPORT_RESPONSE_TIME =
    'Срок ответа на обращение — не более 2 рабочих дней (обычно отвечаем в течение 1 рабочего дня).';

export const SUPPORT_VENDOR = `Вендор: ${VENDOR_SHORT_NAME}, ИНН ${VENDOR_INN}.`;

export const SUPPORT_REQUEST_GUIDE_TITLE = 'Как написать обращение';

export const SUPPORT_REQUEST_GUIDE_INTRO =
    'Чтобы мы помогли быстрее, укажите в письме:';

export const SUPPORT_REQUEST_GUIDE_ITEMS: string[] = [
    'Адрес вашего портала Битрикс24 (например, company.bitrix24.ru).',
    'Продукт приложения: Звонки, Конструктор КП, Отчёт ОП KPI или кабинет.',
    'Описание проблемы и шаги, которые к ней привели.',
    'Скриншот экрана с ошибкой (если есть).',
];
