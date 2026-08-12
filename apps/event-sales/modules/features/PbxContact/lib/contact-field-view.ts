import {
    EV_CONTACT_ITEM_PROP,
    PBX_FIELD_TYPE,
    type PBXContactFieldData,
} from '@/modules/entities/EventContact/type/pbx-contact-type';

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
 * Куда «хорошо» по шкале характеристики.
 *
 * Характеристики разные по смыслу: у «Принятия решений» рост — это хорошо,
 * у «Контакта с конкурентом» рост — это плохо, а у «Частоты звонков» роста
 * в оценочном смысле нет вовсе. Красить их одной рампой значит врать: зелёный
 * хвост у контакта с конкурентом читался бы как достижение.
 */
export type ScaleDirection = 'up' | 'down' | 'neutral';

/**
 * Направление шкалы по коду поля.
 *
 * Значения (items) приходят с портала и своей градации не несут — направление
 * знает только предметная область, поэтому оно живёт здесь таблицей.
 * Неизвестный код — 'neutral': лучше не оценивать, чем оценить наугад.
 */
export const CONTACT_SCALE_DIRECTION: Record<
    EV_CONTACT_ITEM_PROP,
    ScaleDirection
> = {
    /** ЛПР — чем ближе к «решает сам», тем лучше. */
    [EV_CONTACT_ITEM_PROP.ork_is_lpr]: 'up',
    /** Статус клиента — движение по лестнице отношений вверх. */
    [EV_CONTACT_ITEM_PROP.contact_client_status]: 'up',
    [EV_CONTACT_ITEM_PROP.op_client_status]: 'up',
    /** Основной пользователь — чем больше работает с продуктом, тем лучше. */
    [EV_CONTACT_ITEM_PROP.ork_is_most_user]: 'up',
    /** Контакт с нами — рост хороший. */
    [EV_CONTACT_ITEM_PROP.ork_contact_garant]: 'up',
    /** Контакт с конкурентом — рост ПЛОХОЙ, шкала красится в обратную сторону. */
    [EV_CONTACT_ITEM_PROP.ork_contact_concurent]: 'down',
    /** Чек — чем выше, тем лучше. */
    [EV_CONTACT_ITEM_PROP.ork_chk_garant]: 'up',
    /** Потребности — это вид, а не оценка. */
    [EV_CONTACT_ITEM_PROP.ork_needs]: 'neutral',
    /** Частота звонков — предпочтение клиента, «хорошей» стороны нет. */
    [EV_CONTACT_ITEM_PROP.ork_call_frequency]: 'neutral',
};

/** Рост — хорошо: приглушённый → внимание → успех. */
const RAMP_UP = [
    'var(--muted-foreground)',
    'var(--warning)',
    'var(--success)',
];
/** Рост — плохо: та же шкала, но хвост красный. */
const RAMP_DOWN = [
    'var(--muted-foreground)',
    'var(--warning)',
    'var(--destructive)',
];
/** Оценки нет — только позиция, нейтральным цветом темы. */
const RAMP_NEUTRAL = ['var(--muted-foreground)', 'var(--primary)'];

export const traitDirection = (code: string): ScaleDirection =>
    CONTACT_SCALE_DIRECTION[code as EV_CONTACT_ITEM_PROP] ?? 'neutral';

/** Рампа шкалы характеристики — по направлению её кода. */
export const traitRamp = (code: string): string[] => {
    const direction = traitDirection(code);
    if (direction === 'up') return RAMP_UP;
    if (direction === 'down') return RAMP_DOWN;
    return RAMP_NEUTRAL;
};

/**
 * Характеристики, которые вообще можно выставить шкалой: строковые поля
 * редактируются формой контакта в Битриксе, а пустой список значений рисовать
 * нечем.
 */
export const editableTraits = (
    fields: PBXContactFieldData[] | undefined,
): PBXContactFieldData[] =>
    (fields ?? []).filter(
        field =>
            field.items.length > 0 &&
            (field.field.type === PBX_FIELD_TYPE.ENUM ||
                field.field.type === PBX_FIELD_TYPE.SELECT),
    );

/** Сколько характеристик заполнено — подпись «4 из 9» под миниатюрой. */
export const traitsProgress = (
    fields: PBXContactFieldData[],
): { filled: number; total: number } => ({
    filled: fields.filter(field => currentItemIndex(field) >= 0).length,
    total: fields.length,
});
