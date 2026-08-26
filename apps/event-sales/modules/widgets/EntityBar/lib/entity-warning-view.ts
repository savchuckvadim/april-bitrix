import type { RelationsBarNotice } from '@/modules/entities/RelatedCrm';
import type {
    EntityWarning,
    EntityWarningTone,
} from './hooks/use-entity-warnings';

/**
 * Чистые функции представления предупреждений шапки: полный текст для
 * тултипа/aria, тон маркера и маппинг хинтов о выборе главной сделки
 * (RelationsBarNotice) в пилюли EntityWarning.
 */

/** Полный текст предупреждения (тултип маркера, aria). */
export const entityWarningFullText = (warning: EntityWarning): string =>
    warning.accent
        ? `${warning.text}${warning.accent.text}${warning.accent.after ?? ''}`
        : warning.text;

/** Тон предупреждения с дефолтом от blocking (легаси-пилюли тона не несут). */
export const entityWarningTone = (warning: EntityWarning): EntityWarningTone =>
    warning.tone ?? (warning.blocking ? 'destructive' : 'warning');

/** Самый тревожный тон набора — им красится маркер-иконка у названия. */
export const entityWarningsMarkerTone = (
    warnings: EntityWarning[],
): EntityWarningTone => {
    const tones = warnings.map(entityWarningTone);
    if (tones.includes('destructive')) return 'destructive';
    if (tones.includes('warning')) return 'warning';
    return 'info';
};

export const RELATION_NOTICE_TEXT = {
    /** Кейс «своя открытая»: автопереключение состоялось — инфо-хинт. */
    ownSwitchPrefix: 'Сделка контекста закрыта — работа продолжается в открытой „',
    ownSwitchSuffix: '“',
    /** Кейс «чужая открытая»: переключения не было — warning с именем. */
    foreignPrefix: 'У клиента есть открытая сделка менеджера ',
    foreignNoName: 'У клиента есть открытая сделка другого менеджера',
} as const;

/**
 * Хинт о выборе главной сделки → пилюля всплывашки у названия сущности.
 * Длинное (название сделки, имя менеджера) уходит в accent — пилюля рисует
 * его с потолком ширины и truncate.
 */
export const relationNoticeToWarning = (
    notice: RelationsBarNotice,
): EntityWarning => {
    if (notice.kind === 'ownOpenSwitch') {
        return {
            id: `relation-own-switch-${notice.deal.id}`,
            text: RELATION_NOTICE_TEXT.ownSwitchPrefix,
            accent: {
                text: notice.deal.title,
                after: RELATION_NOTICE_TEXT.ownSwitchSuffix,
            },
            blocking: false,
            tone: 'info',
        };
    }
    const responsibleName = notice.deal.responsible?.name?.trim();
    return {
        id: `relation-foreign-${notice.deal.id}`,
        ...(responsibleName
            ? {
                  text: RELATION_NOTICE_TEXT.foreignPrefix,
                  accent: { text: responsibleName },
              }
            : { text: RELATION_NOTICE_TEXT.foreignNoName }),
        blocking: false,
        tone: 'warning',
    };
};
