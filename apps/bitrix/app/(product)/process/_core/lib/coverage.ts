/**
 * Арифметика двух покрытий — сердце страницы.
 *
 * Процесс — один сквозной хребет стадий. Лид и Сделка не делят его пополам:
 * это два независимых покрытия поверх одного хребта.
 *   • Лид растёт ВПЕРЁД от начала (0 % — лида нет).
 *   • Сделка растёт НАЗАД от конца (0 % — сделка только в финале, потому что
 *     продажа сама по себе и есть сделка).
 * Между ними может быть разрыв, они могут стыковаться, перекрываться и —
 * на максимуме обеих крутилок — полностью дублировать друг друга.
 *
 * Конверсионный хвост воронки лиду не принадлежит никогда: к моменту закрытия
 * сделки лид уже сконвертирован. Это выражено флагом ProcessStage.canBeLead.
 */

import { SALES_QUESTIONS } from '../constants/questions';
import {
    CallsAppPlacement,
    CoverageRelation,
    ProcessConfig,
    ProcessDefinition,
    ProcessModel,
    StageOwner,
    StageView,
} from '../types';
import {
    collectEffects,
    resolveActorOverrides,
    resolveExitActors,
    resolveStepActors,
    resolveExitHints,
    resolveHiddenEntryPointIds,
    resolveHiddenExitIds,
    resolveHiddenSatelliteIds,
    resolveKpiFromIndex,
    resolveKpiSource,
    resolveLeadCap,
    resolveSyncLeadStatuses,
} from './question-effects.util';

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

/** Крутилка приходит из UI, но может прийти и из URL — чиним на входе. */
const normalizePct = (value: number): number =>
    Number.isFinite(value) ? clamp(Math.round(value), 0, 100) : 0;

/**
 * Сколько стадий с начала держит лид.
 * 0 % — ни одной (лида в процессе нет), 100 % — все разрешённые ему.
 */
const leadStageCount = (leadPct: number, eligible: number): number =>
    clamp(Math.round((normalizePct(leadPct) / 100) * eligible), 0, eligible);

/**
 * Сколько стадий с конца держит сделка.
 * 0 % — ровно одна, финальная: продажа не может не быть сделкой.
 * 100 % — весь хребет.
 */
const dealStageCount = (dealPct: number, total: number): number =>
    total === 0
        ? 0
        : clamp(
              Math.round((normalizePct(dealPct) / 100) * (total - 1)) + 1,
              1,
              total,
          );

const resolveOwner = (isLead: boolean, isDeal: boolean): StageOwner => {
    if (isLead && isDeal) return 'both';
    if (isLead) return 'lead';
    if (isDeal) return 'deal';
    return 'none';
};

/**
 * Приложение «Звонки» — форма МЕНЕДЖЕРА, поэтому она стоит только там, где
 * менеджер действительно работает.
 *
 * Отсюда два условия. Стадии, которые ведёт система или руководитель, рабочим
 * местом не считаются: например при «Админ + Сделка» лид держит одну «Новую»,
 * но разбирает её администратор — менеджер в лид не заходит вовсе. И
 * закрывающая стадия не в счёт: после продажи приложение перестаёт видеть
 * сделку как текущую, поэтому «сделка на 0 %» — это факт продажи, а не место
 * работы.
 */
const resolveCallsApp = (stages: StageView[]): CallsAppPlacement => {
    const isManagerWorkplace = (view: StageView) => view.actor === 'mgr';

    const inLead = stages.some(
        view => view.isLeadCovered && isManagerWorkplace(view),
    );
    const inDeal = stages.some(
        view =>
            view.isDealCovered &&
            !view.stage.isClosing &&
            isManagerWorkplace(view),
    );

    return { inLead, inDeal, isSplit: inLead && inDeal };
};

const resolveRelation = (
    overlapCount: number,
    gapCount: number,
    isLeadFull: boolean,
    isDealFull: boolean,
): CoverageRelation => {
    if (gapCount > 0) return 'gap';
    if (isLeadFull && isDealFull) return 'duplicate';
    if (overlapCount > 0) return 'overlap';
    return 'seam';
};

/**
 * Разбирает конфигурацию портала в модель отрисовки. Чистая функция: никакого
 * DOM, никакого localStorage — всё, что видно на экране, выводится отсюда.
 */
export const deriveProcessModel = (
    definition: ProcessDefinition,
    config: ProcessConfig,
): ProcessModel => {
    const { stages } = definition;
    const total = stages.length;
    const eligible = stages.filter(stage => stage.canBeLead).length;

    const effects = collectEffects(SALES_QUESTIONS, config.answers);
    const actorOverrides = resolveActorOverrides(effects);
    const kpiFromIndex = resolveKpiFromIndex(definition, effects);
    const leadCap = resolveLeadCap(definition, effects);

    /**
     * Регламент сильнее ползунка: если портал запретил доводить лид дальше
     * какой-то стадии, ползунок на 100 % его туда всё равно не пустит.
     */
    const dialLeadCount = leadStageCount(config.leadPct, eligible);
    const leadCount =
        leadCap === null
            ? dialLeadCount
            : Math.min(dialLeadCount, leadCap.index + 1);

    /**
     * Конверсионный хвост сделка держит всегда: лид владеть им не может по
     * определению, а закрыться процесс где-то обязан. Без этого правила на
     * минимальной ползунке сделки в конце воронки появлялся бы бессмысленный
     * «разрыв» — стадия, которую не ведёт вообще никто.
     */
    const tailStart = stages.findIndex(stage => !stage.canBeLead);
    const dealStart = Math.min(
        total - dealStageCount(config.dealPct, total),
        tailStart === -1 ? total : tailStart,
    );

    const stageViews: StageView[] = stages.map((stage, index) => {
        const isLeadCovered = stage.canBeLead && index < leadCount;
        const isDealCovered = index >= dealStart;

        return {
            stage,
            index,
            owner: resolveOwner(isLeadCovered, isDealCovered),
            isLeadCovered,
            isDealCovered,
            actor: actorOverrides.get(stage.id) ?? stage.actor,
            writesKpi: stage.writesKpi && index >= kpiFromIndex,
            // Лид сюда не дошёл из-за регламента, а не из-за ползунка.
            isBlockedForLead:
                stage.canBeLead && index < dialLeadCount && index >= leadCount,
        };
    });

    const overlapCount = stageViews.filter(
        view => view.owner === 'both',
    ).length;
    const gapCount = stageViews.filter(view => view.owner === 'none').length;

    const hiddenExitIds = resolveHiddenExitIds(effects);
    const hiddenSatelliteIds = resolveHiddenSatelliteIds(effects);
    const exitActors = resolveExitActors(effects);
    const exitHints = resolveExitHints(effects);
    const hiddenEntryPointIds = resolveHiddenEntryPointIds(effects);

    return {
        exits: definition.exits
            .filter(exit => !hiddenExitIds.has(exit.id))
            .map(exit => ({
                ...exit,
                actor: exitActors.get(exit.id),
                hint: exitHints.get(exit.id) ?? exit.hint,
            })),
        entryPoints: definition.entryPoints.filter(
            entry => !hiddenEntryPointIds.has(entry.id),
        ),
        satellites: definition.satellites.filter(
            satellite => !hiddenSatelliteIds.has(satellite.id),
        ),
        stepActors: resolveStepActors(effects),
        kpiSource: resolveKpiSource(effects),
        leadCapStageId: leadCap?.stageId ?? null,
        syncLeadStatuses: resolveSyncLeadStatuses(effects),
        stages: stageViews,
        leadEnd: leadCount - 1,
        dealStart,
        overlapCount,
        gapCount,
        relation: resolveRelation(
            overlapCount,
            gapCount,
            eligible > 0 && leadCount === eligible,
            dealStart === 0,
        ),
        callsApp: resolveCallsApp(stageViews),
    };
};
