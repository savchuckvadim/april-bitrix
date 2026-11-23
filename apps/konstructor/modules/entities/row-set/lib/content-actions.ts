import { isAnyOf } from '@reduxjs/toolkit';
import { rowSetActions } from '../model/RowSetSlice';

/**
 * Действия, после которых меняется содержимое документов: строки набора, их
 * цены и названия, свёрнутость набора, наборы для сравнения, пересчёт цен и
 * раскладка слепка (смена открытого варианта). Один список на всех: по нему
 * превью Word и спецификация договора узнают, что собранное устарело.
 *
 * Вне списка действия экрана и вспомогательные: выбор строки и режим
 * редактирования набора, контекст сборки и налог (цены после них приходят
 * пересчитанным набором, writeSyncedSet), запрос пересчёта (resyncSet) и полный
 * сброс (reset, его слушает смена сделки).
 */
export const isRowSetContentAction = isAnyOf(
    rowSetActions.upsertRow,
    rowSetActions.replaceServiceRow,
    rowSetActions.removeRow,
    rowSetActions.addComparisonSet,
    rowSetActions.removeComparisonSet,
    rowSetActions.toggleCollapsed,
    rowSetActions.editRowCommercial,
    rowSetActions.editTotalCommercial,
    rowSetActions.renameRow,
    rowSetActions.toggleDiscountMode,
    rowSetActions.setRowComposition,
    rowSetActions.writeSyncedSet,
    rowSetActions.restore,
);
