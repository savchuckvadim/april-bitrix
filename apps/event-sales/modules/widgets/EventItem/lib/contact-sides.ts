import { EV_CONTACT_TYPE } from '@/modules/entities/EventContact';

export interface ContactSideDescriptor {
    type: EV_CONTACT_TYPE;
    label: string;
    hint: string;
}

/**
 * Две роли контакта в форме. Данные отдельно от вёрстки: подписи одни и те же
 * в переключателе окна, в подписи поля и в заголовке.
 *
 * Роли действительно разные: разговор мог идти с секретарём, а встречу
 * назначают с директором — поэтому контактов два, а не один общий.
 */
export const CONTACT_SIDES: ContactSideDescriptor[] = [
    {
        type: EV_CONTACT_TYPE.REPORT,
        label: 'С кем говорили',
        hint: 'Контакт этого разговора — попадёт в отчёт и в историю общения.',
    },
    {
        type: EV_CONTACT_TYPE.PLAN,
        label: 'Кому следующий шаг',
        hint: 'Контакт запланированного события — в нём может быть уже другой человек.',
    },
];
