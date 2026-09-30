import type {
    AiAboutInterval,
    AiAboutQualityLink,
    AiAboutQualityLinkStatus,
    AiReadiness,
    AiReadinessBetaSource,
} from '@/modules/entities/ai-analytics/model';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import { formatAiAboutKappa } from './ai-about.util';
import {
    AI_ABOUT_CHECK_LABELS,
    AI_ABOUT_UNKNOWN_BADGE,
    aiAboutCheckOf,
    aiAboutFact as fact,
    aiAboutLabelOf,
    aiAboutLinkSentence,
    formatAiAboutOdds,
    formatAiAboutSectionMonth,
    type AiAboutBadge,
    type AiAboutCheck,
    type AiAboutFact,
    type AiAboutSectionView,
} from './ai-about-phase4.util';

/*
 * «Как считаем» → «Связь качества с результатом»: источник связи, оценка
 * с интервалом словами, надёжность оценок, проверки согласия с фактом и
 * «будущее не предсказывает прошлое», серия проверок и счётчик до оценки.
 */

/** Откуда витрина сейчас берёт связь качества с продажами. */
export const AI_ABOUT_BETA_SOURCE_WORDS: Record<AiReadinessBetaSource, string> =
    {
        none: 'пока ниоткуда — план дня считаем без неё',
        hypothesis: 'правило портала (гипотеза из настроек)',
        data: 'по данным портала',
    };

const QUALITY_LINK_BADGE: Record<AiAboutQualityLinkStatus, AiAboutBadge> = {
    insufficient: { label: 'данных пока мало', tone: 'muted' },
    estimated: { label: 'оценена, ещё проверяется', tone: 'info' },
    published: { label: 'учитывается в расчётах', tone: 'success' },
};

const MONTH_GENITIVE_FORMS = ['месяца', 'месяцев', 'месяцев'] as const;
const PRESENTATION_FORMS = [
    'презентация',
    'презентации',
    'презентаций',
] as const;
const MANAGER_FORMS = ['менеджер', 'менеджера', 'менеджеров'] as const;

/**
 * Согласие прогноза шансов с фактом: пройдена, если интервал наклона
 * накрывает 1 (идеальное согласие); без интервала — не проверялась.
 */
export const aiAboutCalibrationCheck = (
    slope: AiAboutInterval | null,
): AiAboutCheck =>
    slope && slope.low !== null && slope.high !== null
        ? aiAboutCheckOf(slope.low <= 1 && slope.high >= 1)
        : 'unknown';

/** «пройдена 1 из 2 месяцев подряд». */
export const formatAiAboutGateStreak = (passed: number, need: number): string =>
    `пройдена ${passed} из ${need} ${pluralRu(need, MONTH_GENITIVE_FORMS)} подряд`;

/** Счётчик до оценки: «≈ 120 презентаций / ≈ 3 мес.»; объём набран — ждём пересчёта. */
export const formatAiAboutCountdown = (
    countdown: AiReadiness['betaCountdown'],
): string | null => {
    if (!countdown) return null;
    const left = Math.max(0, Math.ceil(countdown.presentationsLeft));
    if (left === 0) return 'объём набран — ждём ближайшего пересчёта';
    const parts = [`≈ ${left} ${pluralRu(left, PRESENTATION_FORMS)}`];
    if (countdown.monthsLeft !== null && countdown.monthsLeft > 0) {
        parts.push(`≈ ${Math.max(1, Math.round(countdown.monthsLeft))} мес.`);
    }
    return parts.join(' / ');
};

/**
 * Оценка связи до прохождения проверки не показывается: она считается в
 * тени, и число до проверки могло бы оказаться ложным.
 */
const hiddenLinkSentence = (link: AiAboutQualityLink): string =>
    link.status === 'estimated'
        ? 'посчитана, покажем после проверки'
        : 'не оценена';

const qualityLinkTodo = (
    link: AiAboutQualityLink,
    betaSource: AiReadinessBetaSource | null,
): string => {
    if (link.status === 'published') {
        return 'Ничего делать не нужно: связь уже учтена в плане дня.';
    }
    if (link.status === 'estimated') {
        return `Ничего делать не нужно: связь начнёт учитываться, когда проверка пройдёт ${link.gateMonths} мес. подряд.`;
    }
    return betaSource === 'none'
        ? 'Копите разборы презентаций. Пока ждёте, можно задать гипотезу: настройки витрины, вкладка «Гипотеза качества».'
        : 'Копите разборы презентаций — связь оценится сама.';
};

/**
 * Карточка «Связь качества с результатом». readiness — готовность модели
 * портала (источник связи и счётчик); null — модели нет, строки опускаем.
 */
export const buildAiAboutQualityLink = (
    link: AiAboutQualityLink,
    readiness: AiReadiness | null,
): AiAboutSectionView => {
    // Числа связи — только после проверки (бэк их до неё и не присылает).
    const shown = link.published;
    const main = shown ? (link.pooled ?? link.within) : null;
    const betaSource = readiness?.betaSource ?? null;
    const facts: AiAboutFact[] = [];
    if (betaSource) {
        facts.push(
            fact('Откуда берём связь', AI_ABOUT_BETA_SOURCE_WORDS[betaSource]),
        );
    }
    facts.push(
        fact(
            'Оценка связи',
            shown ? aiAboutLinkSentence(main) : hiddenLinkSentence(link),
            shown
                ? [
                      ...(main
                          ? [`В среднем ${formatAiAboutOdds(main)}.`]
                          : []),
                      ...(link.within
                          ? [
                                `У одного и того же менеджера ${formatAiAboutOdds(link.within)}.`,
                            ]
                          : []),
                      ...(link.between
                          ? [
                                `Между менеджерами ${formatAiAboutOdds(link.between)}.`,
                            ]
                          : []),
                  ]
                : [],
        ),
        fact(
            'Надёжность оценки разговора',
            link.reliability === null
                ? 'не измерена — поправка на неё не делалась'
                : `${formatAiAboutKappa(link.reliability)} из 1`,
            ['Насколько повторяется балл, если тот же звонок оценить ещё раз.'],
        ),
        fact(
            'Прогноз шансов сходится с фактом',
            AI_ABOUT_CHECK_LABELS[
                aiAboutCalibrationCheck(link.calibrationSlope)
            ],
            [
                'Сравниваем предсказанную долю КП с фактической по группам звонков.',
            ],
        ),
        fact(
            'Будущее не предсказывает прошлое',
            AI_ABOUT_CHECK_LABELS[aiAboutCheckOf(link.placeboPassed)],
            [
                'Проверяем, что оценка разговора не «знает» о событиях, случившихся позже: иначе связь была бы ложной.',
            ],
        ),
        fact(
            'Проверка',
            formatAiAboutGateStreak(link.gatePassedMonths, link.gateMonths),
        ),
        fact(
            'В оценке',
            `${link.n} ${pluralRu(link.n, PRESENTATION_FORMS)}, из них с КП или счётом — ${link.events}; ${link.managers} ${pluralRu(link.managers, MANAGER_FORMS)}`,
        ),
    );
    const countdown = link.published
        ? null
        : formatAiAboutCountdown(readiness?.betaCountdown);
    if (countdown) facts.push(fact('До оценки', countdown));
    return {
        title: 'Связь качества с результатом',
        month: formatAiAboutSectionMonth(link.monthKey),
        badge: aiAboutLabelOf(
            QUALITY_LINK_BADGE,
            link.status,
            AI_ABOUT_UNKNOWN_BADGE,
        ),
        facts,
        reasons: [],
        todo: qualityLinkTodo(link, betaSource),
    };
};
