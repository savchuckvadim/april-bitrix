/**
 * Разбор ответов на вопросы в набор эффектов, которые применяет движок.
 *
 * Вопрос без эффекта ничего не меняет в картинке — и по правилу приёмки такой
 * вопрос в пульт не попадает. Выключенные вопросы (isActive: false) не влияют
 * ни на что, даже если в хранилище остался ответ с прошлой версии.
 */

import {
    KpiSource,
    ProcessActor,
    ProcessDefinition,
    ProcessQuestion,
    QuestionEffect,
} from '../types';

/** Эффекты выбранных вариантов, в порядке объявления вопросов. */
export const collectEffects = (
    questions: ProcessQuestion[],
    answers: Record<string, string>,
): QuestionEffect[] =>
    questions
        .filter(question => question.isActive)
        .map(question =>
            question.options.find(
                option => option.code === answers[question.id],
            ),
        )
        .map(option => option?.effect)
        .filter((effect): effect is QuestionEffect => Boolean(effect));

/** stageId → исполнитель, назначенный ответом. */
export const resolveActorOverrides = (
    effects: QuestionEffect[],
): Map<string, ProcessActor> => {
    const overrides = new Map<string, ProcessActor>();

    effects.forEach(effect => {
        effect.actorFor?.stageIds.forEach(stageId =>
            overrides.set(stageId, effect.actorFor!.actor),
        );
    });

    return overrides;
};

/** stepId → исполнитель шага, назначенный ответом. */
export const resolveStepActors = (
    effects: QuestionEffect[],
): Map<string, ProcessActor> => {
    const actors = new Map<string, ProcessActor>();

    effects.forEach(effect => {
        effect.actorForStep?.stepIds.forEach(stepId =>
            actors.set(stepId, effect.actorForStep!.actor),
        );
    });

    return actors;
};

/** exitId → тот, кто принимает решение на съезде. */
export const resolveExitActors = (
    effects: QuestionEffect[],
): Map<string, ProcessActor> => {
    const actors = new Map<string, ProcessActor>();

    effects.forEach(effect => {
        effect.actorForExit?.exitIds.forEach(exitId =>
            actors.set(exitId, effect.actorForExit!.actor),
        );
    });

    return actors;
};

const stageIndex = (definition: ProcessDefinition, stageId: string): number =>
    definition.stages.findIndex(stage => stage.id === stageId);

/**
 * Самый строгий из выбранных потолков лида.
 * Возвращает индекс последней разрешённой стадии или null, если потолка нет.
 */
export const resolveLeadCap = (
    definition: ProcessDefinition,
    effects: QuestionEffect[],
): { index: number; stageId: string } | null =>
    effects
        .map(effect => effect.leadCapStageId)
        .filter((stageId): stageId is string => Boolean(stageId))
        .map(stageId => ({ index: stageIndex(definition, stageId), stageId }))
        .filter(cap => cap.index >= 0)
        .reduce<{ index: number; stageId: string } | null>(
            (strictest, cap) =>
                strictest === null || cap.index < strictest.index
                    ? cap
                    : strictest,
            null,
        );

/** С какой стадии начинают писаться записи KPI. 0 — со всех. */
export const resolveKpiFromIndex = (
    definition: ProcessDefinition,
    effects: QuestionEffect[],
): number =>
    effects
        .map(effect => effect.kpiFromStageId)
        .filter((stageId): stageId is string => Boolean(stageId))
        .map(stageId => stageIndex(definition, stageId))
        .filter(index => index >= 0)
        .reduce((strictest, index) => Math.max(strictest, index), 0);

/**
 * Источник цифр отчётности. По умолчанию — события приложения: так работает
 * портал, пока про телефонию отдельно не договорились.
 */
export const resolveKpiSource = (effects: QuestionEffect[]): KpiSource =>
    effects.reduce<KpiSource>(
        (carry, effect) => effect.kpiSource ?? carry,
        'events',
    );

/** Съезды, которые ответы убрали со схемы. */
export const resolveHiddenExitIds = (effects: QuestionEffect[]): Set<string> =>
    new Set(effects.flatMap(effect => effect.hideExitIds ?? []));

/** Воронки-спутники, которых в этом портале нет. */
export const resolveHiddenSatelliteIds = (
    effects: QuestionEffect[],
): Set<string> =>
    new Set(effects.flatMap(effect => effect.hideSatelliteIds ?? []));

/** Точки входа, которых в этом портале нет. */
export const resolveHiddenEntryPointIds = (
    effects: QuestionEffect[],
): Set<string> =>
    new Set(effects.flatMap(effect => effect.hideEntryPointIds ?? []));

/** exitId → уточнённая подсказка. */
export const resolveExitHints = (
    effects: QuestionEffect[],
): Map<string, string> => {
    const hints = new Map<string, string>();

    effects.forEach(effect => {
        effect.exitHints?.exitIds.forEach(exitId =>
            hints.set(exitId, effect.exitHints!.hint),
        );
    });

    return hints;
};

/** Включена ли автоматическая синхронизация статусов лида со сделкой. */
export const resolveSyncLeadStatuses = (effects: QuestionEffect[]): boolean =>
    effects.some(effect => effect.syncLeadStatuses === true);
