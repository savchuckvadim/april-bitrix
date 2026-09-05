import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { reportFrontError } from '@/modules/shared/front-error';
import { toCrmDate, toCrmDateTime } from '@/modules/shared/lib/crm-date';
// Прямой путь, а не барель слайса каталога: барель тянет транспорт.
import { selectQuestionnaireByCode } from '@/modules/entities/Questionnaire/model/selectors';
import type {
    ChecklistDef,
    ChecklistFieldDef,
    ChecklistFieldRef,
} from '../type/call-checklist.type';
import {
    checklistWriteCarriers,
    hasChecklistChoice,
    resolveChecklistField,
    toPortalEnumValue,
    type ChecklistEntityKind,
    type ResolvedChecklistField,
} from '../lib/checklist-values';
import { toPortalBooleanValue } from '../lib/checklist-boolean';
import {
    cancelChecklistSave,
    scheduleChecklistSave,
} from '../lib/checklist-save-queue';
import {
    getChecklistMissing,
    isChecklistRequireChange,
    resolveChecklistFields,
    selectChecklistRows,
} from '../lib/checklist-selectors';
import { callChecklistActions } from './CallChecklistSlice';
import { reportHiddenChecklistQuestions } from './ChecklistHiddenThunk';

/**
 * Значение контрола → значение портального поля.
 *
 * Даты уходят каноном CRM (`DD.MM.YYYY[ HH:mm:ss]`, тот же, что пишет
 * бэкенд), справочник — `bitrixId` ВАРИАНТА ИЗ КАТАЛОГА (портальная анкета
 * приносит его готовым, встроенный вопрос берёт из слепка — резолв сводит
 * оба источника в один список), остальное — как есть. `''` снимает
 * значение. `null` — «писать нечего» (нет такого варианта, вариант без
 * bitrixId, неразбираемая дата): запись отменяется, чужое значение не
 * трогаем.
 */
const toPortalFieldValue = (
    def: ChecklistFieldDef,
    value: string,
    resolved: ResolvedChecklistField,
): string | string[] | null => {
    if (!value) return '';
    if (def.control === 'enumeration') {
        // Множественный справочник (возражения) — массив id; одиночный —
        // один id. Правило одно на оба, см. toPortalEnumValue.
        return toPortalEnumValue(
            resolved.options,
            value,
            Boolean(def.isMultiple),
        );
    }
    // UF-поле типа boolean хранит 1/0; «не выбрано» сюда не доходит (пустое
    // значение снято веткой выше).
    if (def.control === 'boolean') return toPortalBooleanValue(value);
    if (def.control === 'date') return toCrmDate(value);
    if (def.control === 'datetime') return toCrmDateTime(value);
    // Вариант «из пункта» уезжает в строковое поле ТЕКСТОМ: карточку
    // Битрикса читают люди, и код вида `pay_now` был бы там шумом. Значение
    // контрола при этом остаётся кодом — на нём держится выбор в селекте.
    if (hasChecklistChoice(def)) {
        const option = resolved.options.find(item => item.code === value);
        return option?.title ?? value;
    }
    return value;
};

/**
 * Запись поля чек-листа в портал.
 *
 * crm-канал — пессимистично (паттерн PurchaseSignals/Inn): сначала портал,
 * потом стейт; неудача — честная ошибка, значение-факт на экране не
 * подменяется. CRM — источник правды: значение обязано пережить отмену
 * отправки.
 *
 * Остальные каналы — только стейт. `dto` (продажа): значение уедет в payload
 * отправки, бэк запишет его одной операцией со сменой стадии. `smart`:
 * ответ адресован полю ЭЛЕМЕНТА смарта, которого сейчас нет вовсе — его
 * создаст или закроет сам поток отчёта, он же и разложит ответы. `text`:
 * ответ уедет в комментарий события.
 *
 * Вызывается отложенно (см. changeChecklistField) либо явной очисткой —
 * напрямую из UI больше не зовётся.
 */
export const saveChecklistField =
    (ref: ChecklistFieldRef, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const def = ref.def;
        const key = ref.answerKey;
        // В CRM пишет только crm-канал. Ответ dto-канала уезжает payload'ом
        // отправки, ответ smart-канала — конвертом в элемент смарта, ответ
        // text-канала — в комментарий события: все трое живут в стейте и в
        // чужие поля не лезут. У смарт-вопроса при этом ЕСТЬ имя поля — но
        // это имя поля в элементе, и подставлять его в компанию или сделку
        // нельзя, поэтому ветка стоит до всякого резолва носителя.
        if (def.channel !== 'crm') {
            dispatch(callChecklistActions.saveSucceeded({ key, value }));
            return;
        }

        const state = getState();
        const resolved = resolveChecklistField(
            ref,
            state.portal.portal,
            selectChecklistRows(state),
        );
        if (!resolved || !resolved.entityId) return;

        const portalValue = toPortalFieldValue(def, value, resolved);
        if (portalValue === null) return;

        const bitrix = Bitrix.getService();
        const update: Record<
            ChecklistEntityKind,
            (
                id: number,
                payload: Record<string, string | string[]>,
            ) => Promise<unknown>
        > = {
            company: (id, payload) =>
                bitrix.company.update(id, payload as never),
            deal: (id, payload) => bitrix.deal.update(id, payload as never),
            lead: (id, payload) => bitrix.lead.update(id, payload as never),
        };

        dispatch(callChecklistActions.saveStarted({ key }));
        try {
            // Во ВСЕХ носителей поля (сделка И компания): запись в одного
            // разъезжала бы значение-истину — см. checklistWriteCarriers.
            // Последовательно и с общим catch: упавший носитель = честная
            // ошибка с повтором, перезапись уже записанных идемпотентна.
            for (const carrier of checklistWriteCarriers(resolved)) {
                await update[carrier.entity](carrier.entityId, {
                    [carrier.ufKey]: portalValue,
                });
            }
            dispatch(callChecklistActions.saveSucceeded({ key, value }));
        } catch (error) {
            dispatch(
                callChecklistActions.saveFailed({
                    key,
                    message: 'Значение не сохранилось — попробуйте ещё раз',
                }),
            );
            reportFrontError({
                place: 'call-checklist.save',
                message: error instanceof Error ? error.message : String(error),
                // Ключ ответа и код поля — по ключу видно, какой ВОПРОС не
                // записался, по коду — какое поле портала.
                context: { key, code: def.code },
            });
        }
    };

/**
 * Менеджер изменил поле.
 *
 * Два правила, ради которых это отдельный thunk:
 * 1) запись откладывается (CHECKLIST_SAVE_DEBOUNCE_MS) — серия
 *    правок даёт ОДИН update, а промежуточные состояния ввода в портал не
 *    попадают;
 * 2) ПУСТОЕ значение само в портал не уходит. `<input type="date">` отдаёт
 *    `''` на каждом незавершённом вводе, и прежняя запись «как есть» стирала
 *    стоявшую в CRM дату. Стереть значение можно только явно —
 *    {@link clearChecklistField} (кнопка у заполненного поля).
 *
 * Каналы dto/smart/text пишутся сразу: там нет ни запроса, ни чужого
 * значения, которое можно затереть, — только стейт и отправка.
 */
export const changeChecklistField =
    (ref: ChecklistFieldRef, value: string) => (dispatch: AppDispatch) => {
        const key = ref.answerKey;
        dispatch(callChecklistActions.setDraft({ key, value }));

        if (ref.def.channel !== 'crm') {
            cancelChecklistSave(key);
            dispatch(callChecklistActions.saveSucceeded({ key, value }));
            return;
        }

        if (!value) {
            cancelChecklistSave(key);
            return;
        }

        scheduleChecklistSave(key, () => {
            void dispatch(saveChecklistField(ref, value));
        });
    };

/** Явная очистка поля — единственный путь, которым в портал уходит пустота. */
export const clearChecklistField =
    (ref: ChecklistFieldRef) => async (dispatch: AppDispatch) => {
        cancelChecklistSave(ref.answerKey);
        dispatch(
            callChecklistActions.setDraft({ key: ref.answerKey, value: '' }),
        );
        await dispatch(saveChecklistField(ref, ''));
    };

/**
 * Строка базовой сделки для «текущих значений» стадийных чек-листов:
 * во встройке-компании сделки в сторе нет — тянем по predict.baseDealId.
 * Ошибка не блокирует: чек-лист покажет поля без текущих значений.
 */
export const ensureChecklistBaseDeal =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.app.bitrix.deal) return;
        const baseDealId = state.stagePredict.result?.baseDealId;
        if (!baseDealId) return;
        const current = state.callChecklist.baseDeal;
        if (
            current.id === baseDealId &&
            (current.status === 'ready' || current.status === 'loading')
        ) {
            return;
        }

        dispatch(callChecklistActions.baseDealPending({ id: baseDealId }));
        try {
            const row = await Bitrix.getService().deal.get(baseDealId);
            if (row && typeof row === 'object') {
                dispatch(
                    callChecklistActions.baseDealLoaded({
                        id: baseDealId,
                        row: row as unknown as Record<string, unknown>,
                    }),
                );
            } else {
                dispatch(
                    callChecklistActions.baseDealFailed({ id: baseDealId }),
                );
            }
        } catch (error) {
            console.warn('checklist base deal load failed', error);
            dispatch(callChecklistActions.baseDealFailed({ id: baseDealId }));
        }
    };

/**
 * Снимок значений для пунктов с «обязательностью изменения».
 *
 * Момент снимка — появление вопроса на экране: карточка в колонке или
 * открытая модалка. Раньше сравнивать было не с чем, и «требовать новое
 * значение» означало бы «переписать поле хоть чем-нибудь», в том числе тем
 * же самым.
 *
 * Снимаются только пункты `requireChange`: остальным снимок не нужен, а
 * лишние ключи в сторе пришлось бы объяснять. Уже снятые ключи не трогаем —
 * значение фиксируется один раз за сессию (сбрасывается вместе с ответами:
 * `callChecklist/reset`).
 */
export const captureChecklistBaseline =
    (defs: ChecklistDef[]) =>
    (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const known = state.callChecklist.baselineByKey;
        const entries: Record<string, string> = {};
        for (const def of defs) {
            for (const resolved of resolveChecklistFields(state, def)) {
                if (!isChecklistRequireChange(resolved.def)) continue;
                if (resolved.answerKey in known) continue;
                entries[resolved.answerKey] = resolved.currentValue;
            }
        }
        if (Object.keys(entries).length === 0) return;
        dispatch(callChecklistActions.baselineCaptured({ entries }));
    };

/** Открыть модальную анкету по её коду (шаг цепочки send). */
export const openCallChecklist =
    (id: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        // Строка базовой сделки — до снимка: снимать значения раньше, чем
        // они прочитаны, значило бы зафиксировать пустоту вместо того, что
        // стоит в CRM.
        await dispatch(ensureChecklistBaseDeal());
        const def = selectQuestionnaireByCode(getState(), id);
        if (def) {
            dispatch(captureChecklistBaseline([def]));
            // Модалка — второй момент показа анкеты; спрятанные вопросы в ней
            // тем более заметны (менеджер стоит перед пустым окном).
            dispatch(reportHiddenChecklistQuestions([def]));
        }
        dispatch(callChecklistActions.modalOpened({ id }));
    };

/**
 * Подтверждение модалки: обязательные поля закрыты → confirmed → закрыть →
 * если отправка ждала (pendingSend) — продолжить send() ленивым импортом
 * (паттерн AfterPresentation, против цикла модулей). Повторный проход
 * send() откроет СЛЕДУЮЩИЙ неподтверждённый чек-лист или отправит.
 */
export const confirmCallChecklist =
    (id: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        // Анкету ищем в каталоге стора: состав задаёт портал, константы с
        // наборами у движка больше нет.
        const def = selectQuestionnaireByCode(getState(), id);
        if (!def) return;
        const missing = getChecklistMissing(getState(), def);
        if (missing.length > 0) return; // кнопка и так задизейблена

        dispatch(callChecklistActions.setConfirmed({ id }));
        dispatch(callChecklistActions.modalClosed());

        const pending = getState().callChecklist.pendingSend;
        if (pending) {
            dispatch(callChecklistActions.setPendingSend({ status: false }));
            const { send } = await import(
                '@/modules/processes/event/model/SendThunk'
            );
            dispatch(send());
        }
    };

/** Отмена модалки: отправка прервана, менеджер вернулся на форму. */
export const cancelCallChecklist = () => async (dispatch: AppDispatch) => {
    dispatch(callChecklistActions.modalClosed());
    dispatch(callChecklistActions.setPendingSend({ status: false }));
};
