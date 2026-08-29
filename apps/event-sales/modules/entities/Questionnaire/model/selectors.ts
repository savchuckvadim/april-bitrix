import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { FALLBACK_CATALOG } from '../data/fallback-catalog';
import type { QuestionnaireDef } from './questionnaire.type';
import type {
    QuestionnaireCatalogSource,
    QuestionnaireCatalogState,
    QuestionnaireCatalogStatus,
} from './QuestionnaireCatalogSlice';

/**
 * Селекторы каталога — синхронные, над RootState: их читают валидация
 * отправки и выбор следующей модалки, которым нельзя ждать промис.
 */

export const selectQuestionnaireCatalog = (
    state: RootState,
): QuestionnaireCatalogState => state.questionnaireCatalog;

/** Состав РОВНО как он лежит в сторе: портальный либо встроенный. */
const selectCatalogDefs = (state: RootState): QuestionnaireDef[] =>
    state.questionnaireCatalog.defs;

export const selectQuestionnaireCatalogStatus = (
    state: RootState,
): QuestionnaireCatalogStatus => state.questionnaireCatalog.status;

export const selectQuestionnaireCatalogSource = (
    state: RootState,
): QuestionnaireCatalogSource => state.questionnaireCatalog.source;

/** Работаем на встроенном наборе (портального каталога нет или он не приехал). */
export const selectIsQuestionnaireFallback = (state: RootState): boolean =>
    state.questionnaireCatalog.source === 'fallback';

/**
 * ДЕЙСТВУЮЩИЙ состав анкет: портальные анкеты ПЛЮС встроенные наборы,
 * которых портал не замещал. Пустым не бывает: до ответа и после любого
 * провала здесь стоит встроенный набор целиком.
 *
 * Мост со старым каталогом. Портал заводит анкеты постепенно, а флаги
 * `withChecklist*` на боевых порталах включены — если бы первая портальная
 * анкета отменяла встроенный состав, менеджер разом потерял бы шесть
 * работающих наборов. Поэтому встроенные наборы продолжают действовать, а
 * убирает их сам портал:
 * - `legacyChecklistId: 'refine'` — «моя анкета ВМЕСТО встроенной доработки»;
 * - совпадение кодов — то же самое (анкета с кодом `refine` замещает `refine`).
 *
 * Без этого замещения менеджер увидел бы два одинаковых блока и отвечал бы
 * на один и тот же вопрос дважды.
 *
 * Порядок — по `sort` (при равенстве по коду): у портальной анкеты и
 * встроенного набора нумерация общая, и «моя анкета первой» портал задаёт
 * тем же полем, что и всё остальное.
 */
export const selectQuestionnaireDefs = createSelector(
    [selectCatalogDefs, selectQuestionnaireCatalogSource],
    (defs, source): QuestionnaireDef[] => {
        // Встроенный набор действует как есть: замещать самого себя нечем.
        if (source !== 'server') return defs;

        const replaced = new Set<string>();
        for (const def of defs) {
            replaced.add(def.code);
            if (def.legacyChecklistId) replaced.add(def.legacyChecklistId);
        }
        const kept = FALLBACK_CATALOG.filter(def => !replaced.has(def.code));
        if (kept.length === 0) return defs;

        return [...defs, ...kept].sort(
            (a, b) => a.sort - b.sort || a.code.localeCompare(b.code),
        );
    },
);

/**
 * Анкета по коду — по ДЕЙСТВУЮЩЕМУ составу: цепочка модалок в send()
 * открывает и портальные анкеты, и встроенные наборы, которые портал не
 * замещал.
 */
export const selectQuestionnaireByCode = (
    state: RootState,
    code: string,
): QuestionnaireDef | undefined =>
    selectQuestionnaireDefs(state).find(def => def.code === code);
