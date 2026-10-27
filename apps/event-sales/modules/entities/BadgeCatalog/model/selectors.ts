import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { isPresentationDone } from '@/modules/entities/EventPresentation/lib/presentation-done';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import {
    filterCommentBadges,
    filterTitleBadges,
    findDefaultTitleBadge,
} from '../lib/badge-visibility';
import type { BadgeItem } from './badge-catalog.type';

const selectItems = (state: RootState): BadgeItem[] => state.badgeCatalog.items;
const selectWorkStatus = (state: RootState) =>
    state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current.code;
const selectPresentationDone = (state: RootState) =>
    isPresentationDone(state.eventPresentation);
const selectPlanCode = (state: RootState) =>
    state.eventPlan.type.current?.code ?? null;

/** Бейджики под текущий итог работы — для ряда под комментарием. */
export const selectCommentBadges = createSelector(
    [selectItems, selectWorkStatus, selectPresentationDone],
    (items, workStatus, presentationDone) =>
        filterCommentBadges(items, { workStatus, presentationDone }),
);

/** Уточнения названия под выбранный тип события — для кнопки у поля. */
export const selectTitleBadges = createSelector(
    [selectItems, selectPlanCode],
    (items, planCode) => filterTitleBadges(items, planCode),
);

/** Основной текст типа — для автоподстановки названия. */
export const selectDefaultTitleBadge = (state: RootState): BadgeItem | null =>
    findDefaultTitleBadge(selectItems(state), selectPlanCode(state));

/**
 * Имя клиента для названия события: компания, иначе заявка. Контакт сюда
 * не идёт — у события с компанией контактов несколько, и имя одного из них
 * в названии вводило бы в заблуждение.
 */
export const selectClientName = (state: RootState): string =>
    state.app.bitrix.company?.TITLE?.trim() ||
    state.app.bitrix.lead?.TITLE?.trim() ||
    '';
