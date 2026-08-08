import type { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';

/**
 * Как показывать pbx-характеристику контакта. Данные отдельно от вёрстки.
 */

/**
 * Короткое имя характеристики: с портала они приходят с префиксом отдела
 * («ОРК Принятие решений»), который в карточке контакта не несёт смысла и
 * съедает ширину во фрейме-миниатюре. Режем ТОЛЬКО в отображении — на
 * портале имя остаётся прежним.
 */
export const shortFieldName = (name: string): string =>
    name.replace(/^\s*(ОРК|ОП)\s+/i, '').trim() || name;

/** Индекс текущего значения в items; -1 — не заполнено. */
export const currentItemIndex = (field: PBXContactFieldData): number => {
    const current = field.current;
    if (!current || typeof current !== 'object') return -1;
    return field.items.findIndex(item => item.code === current.code);
};

/** Название текущего значения; не заполнено — null. */
export const currentItemName = (field: PBXContactFieldData): string | null => {
    const current = field.current;
    return current && typeof current === 'object' ? current.name : null;
};

/**
 * Рампа шкалы характеристики: от приглушённого к «хорошему».
 *
 * Порядок значений берём как есть с портала (там он осмысленный: от худшего
 * к лучшему) — своей градации у items нет, придумывать её на фронте значило
 * бы врать. Цвета — токены тем.
 */
export const CONTACT_SCALE_RAMP = [
    'var(--muted-foreground)',
    'var(--warning)',
    'var(--success)',
];
