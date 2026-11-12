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
    /** Перехват клиента: сделка бота / коллеги перейдёт при отправке. */
    botTakePrefix: 'Сделка ',
    takeSuffix: ' перейдёт к вам при отправке отчёта',
    forceTakePrefix: 'Работа менеджера ',
    forceAskSuffix: ' — при отправке можно забрать себе',
} as const;

/** Перехват клиента на портале (настройки report_takeover_*, боты обзвона). */
export interface RelationTakeoverRules {
    force: boolean;
    confirm: boolean;
    botOwnerIds: readonly number[];
}

/**
 * Хинт о выборе главной сделки → пилюля всплывашки у названия сущности.
 * Длинное (название сделки, имя менеджера) уходит в accent — пилюля рисует
 * его с потолком ширины и truncate.
 */
export const relationNoticeToWarning = (
    notice: RelationsBarNotice,
    takeover?: RelationTakeoverRules,
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
    const ownerId = Number(notice.deal.responsible?.id) || 0;
    // Перехват клиента: чужая сделка не повод для тревоги — она перейдёт к
    // менеджеру при отправке (бот — всегда, коллега — в режиме перехвата).
    const isBot = Boolean(ownerId && takeover?.botOwnerIds.includes(ownerId));
    if (responsibleName && (isBot || takeover?.force)) {
        const askFirst = !isBot && takeover?.confirm;
        return {
            id: `relation-take-${notice.deal.id}`,
            text: isBot
                ? RELATION_NOTICE_TEXT.botTakePrefix
                : RELATION_NOTICE_TEXT.forceTakePrefix,
            accent: {
                text: responsibleName,
                after: askFirst
                    ? RELATION_NOTICE_TEXT.forceAskSuffix
                    : RELATION_NOTICE_TEXT.takeSuffix,
            },
            blocking: false,
            tone: 'info',
        };
    }
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
