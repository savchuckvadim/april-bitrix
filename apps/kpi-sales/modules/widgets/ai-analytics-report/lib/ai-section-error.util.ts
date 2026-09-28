/*
 * Подсказки к ошибкам секций вкладки. В `section.error` лежит текст
 * сервера из тела 403/400 (`lib/ai-error.util.ts` сущности) либо его
 * запасной текст («Доступ к разделу закрыт»). По тексту узнаём типовые
 * случаи и добавляем строку «что это значит» — без ключей настроек и
 * кодов ответа: что нельзя сделать из витрины, просят у разработчика.
 * Маркеры покрывают и прежние, и новые формулировки бэка.
 */

export const AI_SECTION_ERROR_HINTS = {
    /** Менеджер без роли руководителя при выключенном «Менеджер видит свою аналитику». */
    selfView:
        'Витрина открыта руководителям. Чтобы менеджеры видели свои данные, попросите разработчика включить это.',
    /** Раздел выключен признаком портала (план дня и т. п.). */
    disabled:
        'Раздел выключен на портале — чтобы включить, попросите разработчика.',
    /** Менеджер вне периметра видимости по структуре. */
    scope: 'Менеджер не входит в ваш периметр видимости по структуре компании.',
    /** Действие только руководителям cup/op/group. */
    leaderOnly: 'Действие доступно только руководителю отдела продаж.',
    /** Отказ в доступе без распознанного текста. */
    forbidden:
        'Доступ закрыт: проверьте роль в структуре компании или обратитесь к разработчику.',
} as const;

export type AiSectionErrorKind = keyof typeof AI_SECTION_ERROR_HINTS;

const FORBIDDEN_CODE = /\b403\b/;

/** Маркеры текстов бэка (старых и новых) по видам ошибки, в нижнем регистре. */
const KIND_MARKERS: readonly [AiSectionErrorKind, readonly string[]][] = [
    [
        'selfView',
        ['self_view', 'доступна руководителям', 'видит свою аналитику'],
    ],
    ['disabled', ['выключен', '_enabled']],
    ['scope', ['вне периметра']],
    ['leaderOnly', ['только руководител']],
    [
        'forbidden',
        ['forbidden', 'доступ закрыт', 'доступ к разделу закрыт', 'доступ запрещ'],
    ],
];

/** Типовой случай ошибки по тексту сервера или запасному тексту; null — не типовой. */
export const detectAiSectionErrorKind = (
    error: string | null | undefined,
): AiSectionErrorKind | null => {
    if (!error) return null;
    const text = error.toLowerCase();
    for (const [kind, markers] of KIND_MARKERS) {
        if (markers.some(marker => text.includes(marker))) return kind;
    }
    return FORBIDDEN_CODE.test(text) ? 'forbidden' : null;
};

/** Подсказка «что это значит» к ошибке секции; null — подсказки нет. */
export const aiSectionErrorHint = (
    error: string | null | undefined,
): string | null => {
    const kind = detectAiSectionErrorKind(error);
    return kind ? AI_SECTION_ERROR_HINTS[kind] : null;
};

/** Ошибка доступа/настройки: повтор без изменений на портале не поможет. */
export const isAiSectionAccessError = (
    error: string | null | undefined,
): boolean => detectAiSectionErrorKind(error) !== null;
