import type { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import {
    getReportDataNeeds,
    type ReportDataNeeds,
} from '../lib/report-data-needs.util';
import type { ReportFlowKind } from './report-queue.util';

/**
 * Заявки на данные «вне вкладки». Карта нужд отвечает за вкладки отчёта, но
 * данные бывают нужны и тому, что вкладкой не является: страница сотрудника
 * берёт заглавный показатель из командного отчёта по событиям, с какой бы
 * вкладки на неё ни пришли. Такой потребитель заявляет источник на время
 * своей жизни; загрузка «по необходимости» и «Применить» учитывают заявки
 * наравне с нуждами вкладки.
 *
 * Счётчик, а не флаг: заявителей одного источника может быть несколько.
 */
const demands: Record<ReportFlowKind, number> = { report: 0, calling: 0 };

/** Заявить источник; возвращает снятие заявки (повторный вызов безвреден). */
export const addReportDataDemand = (kind: ReportFlowKind): (() => void) => {
    demands[kind] += 1;
    let released = false;
    return () => {
        if (released) return;
        released = true;
        demands[kind] = Math.max(0, demands[kind] - 1);
    };
};

/** Снять все заявки — для тестов. */
export const resetReportDataDemands = (): void => {
    demands.report = 0;
    demands.calling = 0;
};

/**
 * Что нужно загрузить прямо сейчас: нужды вкладки плюс заявки потребителей
 * вне вкладки. Блокирующий источник заявки не меняют — страницу по-прежнему
 * держит только главный источник вкладки.
 */
export const activeReportDataNeeds = (type: EReportType): ReportDataNeeds => {
    const needs = getReportDataNeeds(type);
    return {
        events: needs.events || demands.report > 0,
        callings: needs.callings || demands.calling > 0,
        blocking: needs.blocking,
    };
};
