import type { SimState } from './simulator.util';
import type { ProcessSatellite } from '../types';

export interface SatelliteState {
    satellite: ProcessSatellite;
    /** Стадия, на которой сейчас стоит спутник. */
    stageId: string;
    isClosed: boolean;
    /** Сколько сущностей этой воронки живёт (для презентаций их много). */
    count: number;
    /** Почему спутник в этом состоянии — одной строкой. */
    reason: string;
}

/**
 * Куда встаёт каждая воронка-спутник при исходе основной сделки.
 *
 * Правило одно: продажа и отказ закрывают ВСЁ, но каждая дополнительная
 * воронка закрывается по своему условию и на своей терминальной стадии — у неё
 * собственная лестница, а не отражение основной.
 *
 * Сверено с `deal-target-stage.calculator.ts`: у ХО суффиксы `cold_*`,
 * у презентаций `spres_*`, у ТМЦ `sales_tmc_*`, и в каждой тройке
 * success / fail / noresult выбираются одинаково — по исходу и по
 * результативности отчёта.
 */
const terminalStage = (
    prefix: string,
    status: SimState['status'],
): string | null => {
    if (status === 'sale') return `${prefix}_success`;
    if (status === 'fail') return `${prefix}_fail`;
    return null;
};

const xoState = (
    satellite: ProcessSatellite,
    state: SimState,
): SatelliteState => {
    const closedByOwnReport = state.log.some(entry =>
        entry.action.includes('«Холодный звонок»'),
    );
    const terminal = terminalStage('cold', state.status);

    if (closedByOwnReport) {
        return {
            satellite,
            stageId: 'cold_success',
            isClosed: true,
            count: 1,
            reason: 'закрылся своим условием — после первого же отчёта по холодному звонку',
        };
    }

    if (terminal) {
        return {
            satellite,
            stageId: terminal,
            isClosed: true,
            count: 1,
            reason: 'закрылся вместе с основной сделкой: отчёта по холодному звонку так и не было',
        };
    }

    return {
        satellite,
        stageId: 'cold_plan',
        isClosed: false,
        count: 1,
        reason: 'ждёт первого отчёта по холодному звонку',
    };
};

const presentationState = (
    satellite: ProcessSatellite,
    state: SimState,
): SatelliteState | null => {
    /**
     * Считаем по записям KPI, а не по текущим задачам: продажа и отказ
     * очищают список дел, а сделки-презентации от этого не исчезают — они
     * остаются в своей воронке, просто закрытыми.
     */
    const kpi = state.log.flatMap(entry => entry.kpi);
    const planned = kpi.filter(
        record => record.label === 'Презентация запланирована',
    ).length;
    const done = kpi.filter(
        record => record.label === 'Презентация проведена',
    ).length;
    /**
     * Встречи, которые не состоялись: отчитались по презентации результативно,
     * но отметку «проведена» сняли. Такая сделка закрывается на «Не
     * состоялась» — открытой ей висеть незачем, новую встречу заводят новой
     * сделкой.
     */
    const missed = state.log.filter(entry =>
        entry.systemActions.some(action =>
            action.includes('закрыта на «Не состоялась»'),
        ),
    ).length;

    /**
     * Перенесённые встречи. Нерезультативный отчёт с назначенным следующим
     * шагом не закрывает сделку-презентацию, а ставит её в «Перенос»: встреча
     * жива и ждёт новой даты. Считаем их отдельно от несостоявшихся — иначе
     * перенос выглядел бы срывом.
     */
    const postponed = state.log.filter(entry =>
        entry.systemActions.some(action =>
            action.includes('переведена в «Перенос»'),
        ),
    ).length;

    /**
     * Перенесённая встреча тоже считается: записи KPI по ней нет (отчёт был
     * нерезультативным), но сделка-презентация существует и висит в «Переносе».
     * Без этого спутник пропадал бы с экрана ровно в тот момент, когда с ним
     * что-то произошло.
     */
    if (planned + done + missed + postponed === 0) return null;

    /**
     * Незакрытые встречи — это разница между назначенными и проведёнными.
     * По списку дел считать нельзя: продажа и отказ его очищают, и тогда любая
     * сорванная презентация выглядела бы состоявшейся.
     */
    const openNow = Math.max(0, planned + postponed - done - missed);
    const terminal = terminalStage('spres', state.status);

    if (terminal) {
        return {
            satellite,
            stageId: terminal,
            isClosed: true,
            count: planned + done + missed + postponed,
            reason:
                openNow === 0
                    ? 'все встречи прошли — эти сделки закрылись своим условием, ещё до исхода'
                    : state.status === 'sale'
                      ? `${openNow} встреч(и) так и не состоялись, но продажа закрыла и их — в этой воронке они встают на «Проведена». Место, которое стоит обсудить: формально встречи не было.`
                      : `${openNow} встреч(и) не состоялись — отказ закрыл их на своей стадии «Отказ», отдельно от основной сделки`,
        };
    }

    if (openNow > 0) {
        return {
            satellite,
            stageId: postponed > 0 ? 'spres_pending' : 'spres_plan',
            isClosed: false,
            count: planned + done + missed + postponed,
            reason:
                postponed > 0
                    ? 'встречу перенесли: следующий шаг назначен, сделка-презентация жива и ждёт новой даты'
                    : 'встреча назначена и ещё не прошла',
        };
    }

    return {
        satellite,
        stageId: missed > 0 && done === 0 ? 'spres_noresult' : 'spres_success',
        isClosed: true,
        count: planned + done + missed + postponed,
        reason:
            missed > 0
                ? `не состоявшихся встреч: ${missed} — они закрыты на «Не состоялась», своим условием`
                : 'все встречи прошли — эти сделки закрылись своим условием',
    };
};

const tmcState = (
    satellite: ProcessSatellite,
    state: SimState,
): SatelliteState => {
    const terminal = terminalStage('sales_tmc', state.status);

    if (terminal) {
        return {
            satellite,
            stageId: terminal,
            isClosed: true,
            count: 1,
            reason: 'ТМЦ закрывается по отчёту о презентации — исход основной сделки её и закрыл',
        };
    }

    return {
        satellite,
        stageId: 'sales_tmc_new',
        isClosed: false,
        count: 1,
        reason: 'заявка ТМЦ ведётся параллельно',
    };
};

/** Состояние всех спутников при текущем шаге симулятора. */
export const satelliteStates = (
    satellites: ProcessSatellite[],
    state: SimState,
): SatelliteState[] =>
    satellites
        .map(satellite => {
            if (satellite.id === 'xo') return xoState(satellite, state);
            if (satellite.id === 'presentation') {
                return presentationState(satellite, state);
            }
            if (satellite.id === 'tmc') return tmcState(satellite, state);
            return null;
        })
        .filter((item): item is SatelliteState => item !== null);
