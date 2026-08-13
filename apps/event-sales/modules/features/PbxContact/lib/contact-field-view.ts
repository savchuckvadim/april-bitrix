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
 * Направление задаётся ПОРЯДКОМ значений на портале, а не смыслом названия, и
 * порядок этот бывает какой угодно: «Отношение к Гаранту» идёт от «Фанат
 * Гаранта» к «Противник Гаранта» (то есть вниз), а «Отношение к конкуренту» —
 * от «Фанат конкурента» к «Противник конкурента» (для нас вверх). Два поля-
 * близнеца красятся в противоположные стороны, и угадать это по имени нельзя.
 *
 * Поэтому таблица заполнена по реальным спискам значений (снимок портала,
 * apps/admin/modules/entities/pbx/monitoring.json), а каждая строка называет
 * лестницу, на которую опирается. Неизвестный код — 'neutral': лучше не
 * оценивать, чем оценить наугад.
 */
export const CONTACT_SCALE_DIRECTION: Record<
    EV_CONTACT_ITEM_PROP,
    ScaleDirection
> = {
    /** Ничего не решает → Спросят совета → … → ЛПР. */
    [EV_CONTACT_ITEM_PROP.ork_is_lpr]: 'up',
    /** Свободен → ЧОК/НОК/ОК → Чужой КУП… → Свой КГУ РП. */
    [EV_CONTACT_ITEM_PROP.op_client_status]: 'up',
    /** Неудовлетворены → Частично → Почти → Удовлетворены (10→40). */
    [EV_CONTACT_ITEM_PROP.ork_needs]: 'up',
    /** Не трогать → В критических → Полгода → … → Неделя (10→70): чем чаще
     *  пускают звонить, тем теплее отношения. */
    [EV_CONTACT_ITEM_PROP.ork_call_frequency]: 'up',
    /** Фанат конкурента → … → Противник конкурента: для нас рост хороший. */
    [EV_CONTACT_ITEM_PROP.ork_contact_concurent]: 'up',
    /** Фанат Гаранта → … → Противник Гаранта: рост ПЛОХОЙ, хвост красный. */
    [EV_CONTACT_ITEM_PROP.ork_contact_garant]: 'down',
    /** Да → Нет: «Нет» стоит вторым, поэтому рост здесь плохой. */
    [EV_CONTACT_ITEM_PROP.ork_is_most_user]: 'down',
    /** Одно значение «Пользователь» — это метка, а не шкала. */
    [EV_CONTACT_ITEM_PROP.contact_client_status]: 'neutral',
    /** Да → Нет: «Нет» стоит вторым, поэтому рост здесь плохой. */
    [EV_CONTACT_ITEM_PROP.ork_chk_garant]: 'down',
};

/** Рост — хорошо: приглушённый → внимание → успех. */
const RAMP_UP = ['var(--muted-foreground)', 'var(--warning)', 'var(--success)'];
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

/**
 * Характеристика-флаг: значений ровно два («Да»/«Нет»).
 *
 * Степеней у неё нет, поэтому шкала врёт: «Да» заполняло полполоски и
 * читалось как «наполовину сделано». Такие показываем чипом.
 */
export const isFlagTrait = (field: PBXContactFieldData): boolean =>
    field.items.length === 2;

/**
 * Хорошая ли сторона флага выбрана. У шкал «вниз» лучшее значение первое
 * («Да»), у остальных — последнее: направление уже описано таблицей, второй
 * раз решать нечего.
 */
export const isGoodFlagValue = (
    field: PBXContactFieldData,
    index: number,
): boolean =>
    traitDirection(field.field.code) === 'down'
        ? index === 0
        : index === field.items.length - 1;
