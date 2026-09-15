import {
    clearFromLocalStorage,
    getFromLocalStorage,
    saveToLocalStorage,
} from '@workspace/api';
import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
// Прямой путь, а не барель слайса каталога: барель тянет транспорт.
import { selectQuestionnaireDefs } from '@/modules/entities/Questionnaire/model/selectors';
import {
    getChecklistDraftKey,
    parseChecklistDraft,
    pickChecklistDraftAnswers,
} from '../lib/checklist-draft';
import { callChecklistActions } from './CallChecklistSlice';

/**
 * Черновик ответов анкет в шифрованном localStorage — близнец черновика
 * комментария (`EventReport/model/EventReportThunk`).
 *
 * Переживают перезагрузку только ответы каналов `dto`/`smart`/`text`: они
 * существуют лишь в стейте до самой отправки, и любой уход со страницы
 * (возврат в карточку CRM после ошибки, ⟳, перезапуск фрейма) стирал их
 * молча. Ответ канала `crm` в черновике не участвует — он уже в карточке.
 */

const CHECKLIST_DRAFT_SAVE_DEBOUNCE_MS = 400;

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Отменить отложенную запись — тесты и размонтирование приложения. */
export const cancelChecklistDraftSave = (): void => {
    if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
    }
};

const getDraftContext = (state: RootState) => {
    const isLeadContext = getIsLeadContext(state);
    const app = state.app;
    return {
        domain: app.domain,
        key: getChecklistDraftKey(
            app.domain,
            isLeadContext,
            isLeadContext ? app.bitrix.lead?.ID : null,
            !isLeadContext ? app.bitrix.company?.ID : null,
            app.bitrix.user?.ID,
        ),
    };
};

/**
 * Записать черновик. Отложенно (400 мс) по той же причине, что у
 * комментария: шифровать на каждый символ незачем, а ответы приходят
 * сериями (менеджер правит сумму, потом дату).
 */
export const saveChecklistDraft =
    () => (_dispatch: AppDispatch, getState: AppGetState) => {
        cancelChecklistDraftSave();
        saveTimer = setTimeout(() => {
            saveTimer = null;
            const state = getState();
            const { domain, key } = getDraftContext(state);
            if (!domain) return;
            const draft = pickChecklistDraftAnswers(
                selectQuestionnaireDefs(state),
                state.callChecklist.valueByKey,
            );
            // Пустой черновик стирает ключ (saveToLocalStorage на falsy
            // данных зовёт clear) — мусор в хранилище не копится.
            void saveToLocalStorage(
                key,
                Object.keys(draft).length > 0 ? draft : null,
                domain,
            );
        }, CHECKLIST_DRAFT_SAVE_DEBOUNCE_MS);
    };

/**
 * Восстановить черновик при инициализации.
 *
 * Только в ПУСТОЕ: `answersSeeded` пишет лишь отсутствующие ключи, поэтому
 * восстановление не может затереть ни ответ этой сессии, ни набираемый
 * черновик поля — правило то же, что у комментария («не подменять живое
 * сохранённым»).
 */
export const restoreChecklistDraft =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const { domain, key } = getDraftContext(getState());
        if (!domain) return;

        const entries = parseChecklistDraft(
            await getFromLocalStorage(key, domain),
        );
        if (Object.keys(entries).length === 0) return;

        dispatch(callChecklistActions.answersSeeded({ entries }));
    };

/**
 * Стереть черновик. Зовётся в тот же момент, что `clearCommentDraft`, —
 * отчёт принят к доставке: ответы уехали в payload, и держать их дальше
 * значило бы подставить их в следующий отчёт того же клиента.
 */
export const clearChecklistDraft =
    () => async (_dispatch: AppDispatch, getState: AppGetState) => {
        cancelChecklistDraftSave();
        const { key } = getDraftContext(getState());
        await clearFromLocalStorage(key);
    };
