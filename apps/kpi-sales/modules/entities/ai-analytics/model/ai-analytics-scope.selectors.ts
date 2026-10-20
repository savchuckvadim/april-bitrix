import type { RootState } from '@/modules/app/model/store';
import { aiPilotIds } from '../lib/ai-pilot.util';
import { buildAiScopeNote, type AiScopeNote } from '../lib/ai-scope.util';

/*
 * Селекторы периметра разбора и порогов портала — один источник для чипа
 * в шапке, пустых состояний таблиц, подписи прогноза и подсказок с порогом
 * длительности. Состав строк режет бэк; фронт только подписывает.
 */

/** Примечание о периметре из meta.scope обзора; обзора или поля нет — null. */
export const selectAiScopeNote = (state: RootState): AiScopeNote | null =>
    buildAiScopeNote(state.aiAnalytics.overview.data?.meta.scope);

/** Bitrix-id сотрудников пилота разбора (пусто — ограничения нет). */
export const selectAiPilotIds = (state: RootState): string[] =>
    aiPilotIds(state.aiAnalytics.settings.data?.callReport);

/**
 * Порог длительности звонка для разбора: из ответа пульса (действующий
 * порог портала), иначе из настроек конвейера; нет нигде — null.
 */
export const selectAiMinDurationSec = (state: RootState): number | null =>
    state.aiAnalytics.pulse.data?.minDurationSec ??
    state.aiAnalytics.settings.data?.callReport?.minDurationSec ??
    null;

/** День, с которого на портале идёт AI-разбор; не прочитан — null. */
export const selectAiAnalysisSince = (state: RootState): string | null =>
    state.aiAnalytics.settings.data?.analysisSince ?? null;
