import type { AppThunk } from '@/modules/app/model/store';
import { getComplectVariantPbxSmartEntityId } from '../../portal';
import {
    buildCurrentSnapshotV2,
    restoreSnapshotRecord,
    saveSnapshot,
} from '../../snapshot';
import { ComplectVariantHelper } from '../lib/api/complect-variant-helper';
import {
    isVariantDeletable,
    readDeleteErrorMessage,
    type ComplectVariantDeleteResult,
} from '../lib/delete-variant';
import { buildVariantStageId, type ComplectVariantStage } from '../lib/stage';
import {
    complectVariantActions,
    selectComposition,
} from './ComplectVariantSlice';
import {
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
    type ComplectVariantRecordDto,
} from './dto';

const helper = new ComplectVariantHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

/**
 * Текст отказа, когда правки уходящего варианта не записались: причину
 * (она уже лежит в слайсе от syncOpenComplectVariant) ставим в скобки после
 * названия действия.
 */
const saveBeforeLeaveFailure = (
    action: 'открыт' | 'закрыт',
    reason: string | null,
): string => {
    const base = `Вариант не ${action}: правки текущего варианта не сохранились`;
    return reason ? `${base} (${reason})` : base;
};

/**
 * Варианты комплекта текущей сделки: слепки из базы конструктора, элементы из
 * Битрикса (ради стадии) и настройки сборки. Заодно восстанавливает, какой
 * вариант был открыт — это хранится в настройках сделки.
 *
 * Грузится двумя потоками. Слепки и настройки — из нашей базы, быстро: по ним
 * вход решает, вести ли на экран вариантов. Элементы Битрикса (названия,
 * стадии) идут рядом и вход не держат — экран показывает их, когда придут.
 * Сам thunk завершается, когда пришло всё: после правок вызывающий ждёт полное
 * обновление.
 *
 * Указатели сводит редьюсер `loaded`. Вариант из настроек сделки становится
 * подсказкой `lastOpenVariantSmartId` («открывали в прошлый раз»). Активный
 * указатель `openVariantSmartId` на входе пуст: живое состояние поднято из
 * слепка сделки и варианту равно не обязано. Его ставят только действия
 * сессии, а повторное чтение списка его сохраняет.
 *
 * Смарт на портале не установлен — слайс остаётся пустым, конструктор
 * работает как раньше.
 */
export const fetchComplectVariants =
    (): AppThunk<Promise<void>> => async (dispatch, getState) => {
        const state = getState();
        const { dealId, domain } = state.app;
        const entityTypeId = getComplectVariantPbxSmartEntityId(
            state.portal.current,
        );
        if (!dealId || !domain || !entityTypeId) return;

        dispatch(complectVariantActions.loading());
        const itemsLoading = helper.listItems(entityTypeId, dealId).then(
            items => {
                dispatch(complectVariantActions.itemsLoaded(items));
            },
            (error: unknown) => {
                dispatch(
                    complectVariantActions.failed(
                        errorText(error, 'стадии вариантов не загружены'),
                    ),
                );
            },
        );
        try {
            const [records, composition] = await Promise.all([
                helper.listRecords(domain, dealId),
                helper.getComposition(domain, dealId),
            ]);
            dispatch(complectVariantActions.loaded({ records, composition }));
        } catch (error) {
            dispatch(
                complectVariantActions.failed(
                    errorText(error, 'варианты не загружены'),
                ),
            );
        } finally {
            await itemsLoading;
        }
    };

/** Изменение настроек сборки: пишем только их, слепок не трогаем. */
export const saveComplectComposition =
    (patch: Partial<ComplectComposition>): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const { dealId, domain } = state.app;
        if (!dealId || !domain) return;

        const previous = state.complectVariant.composition;
        const current = selectComposition(state);
        const composition: ComplectComposition = {
            ...DEFAULT_COMPLECT_COMPOSITION,
            ...current,
            ...patch,
            offer: { ...current.offer, ...(patch.offer ?? {}) },
        };

        dispatch(complectVariantActions.clearError());
        dispatch(complectVariantActions.setComposition(composition));
        try {
            await helper.saveComposition(domain, dealId, composition);
        } catch (error) {
            // не сохранилось — возвращаем прежнее, чтобы экран не показывал
            // выбор, которого нет в базе
            dispatch(complectVariantActions.setComposition(previous));
            dispatch(
                complectVariantActions.actionFailed(
                    errorText(error, 'настройки сборки не сохранены'),
                ),
            );
        }
    };

/**
 * Новый вариант из текущего состояния: элемент смарта плюс слепок v2.
 * Состояние сделки не трогается — в том и смысл вариантов. Созданный вариант
 * сразу становится открытым: дальше правки идут в него. Слепок сделки в конце
 * повторяет состояние нового варианта: после перезагрузки страницы живое
 * состояние поднимается из слепка сделки, и оно должно совпасть с открытым
 * вариантом, указатель на который лежит в настройках.
 *
 * Товарные строки в элемент здесь не пишутся: в новом фронте ещё нет
 * маппера строк конструктора в товарные строки Битрикса (фаза 7, deal-send).
 */
export const createComplectVariant =
    (title: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const { dealId } = state.app;
        const entityTypeId = getComplectVariantPbxSmartEntityId(
            state.portal.current,
        );
        if (!dealId || !entityTypeId) return;

        const snapshot = buildCurrentSnapshotV2(state);
        if (!snapshot) {
            dispatch(complectVariantActions.actionFailed('Нечего сохранять'));
            return;
        }

        dispatch(complectVariantActions.clearError());
        dispatch(complectVariantActions.busy(true));
        try {
            const item = await helper.createItem(entityTypeId, dealId, title);
            if (!item) throw new Error('Битрикс не создал элемент варианта');
            await helper.saveRecord(snapshot, item.id);
            dispatch(complectVariantActions.setOpenVariant(item.id));
            await dispatch(
                saveComplectComposition({ openVariantSmartId: item.id }),
            );
            await dispatch(fetchComplectVariants());
        } catch (error) {
            dispatch(
                complectVariantActions.actionFailed(
                    errorText(error, 'вариант не создан'),
                ),
            );
            dispatch(complectVariantActions.busy(false));
            return;
        }

        // Слепок сделки сохраняется последним: к этому моменту указатель уже
        // стоит на новом варианте, и слушатель saveDone пишет текущее состояние
        // именно в него. Итог сохранения лежит в слайсе слепка (saveStatus).
        dispatch(complectVariantActions.busy(true));
        try {
            await dispatch(saveSnapshot());
        } finally {
            dispatch(complectVariantActions.busy(false));
        }
    };

/**
 * Открыть вариант: его запись раскладывается по стейту тем же путём, что и
 * слепок сделки. Пока вариант открыт, живое состояние — это он, а слепок
 * сделки повторяет его на момент открытия и каждого сохранения.
 *
 * Порядок:
 * 1. Запрошен вариант с активным указателем — состояние остаётся как есть:
 *    живое состояние новее любой записи в списке. Вариант из подсказки
 *    «открывали в прошлый раз» (lastOpenVariantSmartId) активным не считается
 *    и открывается обычным путём, из записи.
 * 2. Открыт другой вариант — его правки сначала уходят на сервер. Сохранение
 *    не удалось — переключения нет, иначе правки пропали бы.
 * 3. Раскладывается свежая запись из списка (после шага 2 в нём лежит всё,
 *    что вариант получил за сеанс); переданная запись служит запасной.
 * 4. Указатель открытого варианта и настройки сохраняются, затем слепок
 *    сделки перезаписывается состоянием открытого варианта.
 *
 * Возвращает, открылся ли вариант, — переход экрана делается по факту.
 */
export const openComplectVariant =
    (record: ComplectVariantRecordDto): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const { variantSmartId } = record;
        const { openVariantSmartId } = getState().complectVariant;
        if (variantSmartId !== null && variantSmartId === openVariantSmartId) {
            return true;
        }

        dispatch(complectVariantActions.clearError());
        dispatch(complectVariantActions.busy(true));
        try {
            if (openVariantSmartId !== null) {
                const isLeavingSaved = await dispatch(
                    syncOpenComplectVariant(),
                );
                if (!isLeavingSaved) {
                    dispatch(
                        complectVariantActions.actionFailed(
                            saveBeforeLeaveFailure(
                                'открыт',
                                getState().complectVariant.error,
                            ),
                        ),
                    );
                    return false;
                }
            }

            const fresh =
                getState().complectVariant.records.find(
                    candidate => candidate.variantSmartId === variantSmartId,
                ) ?? record;
            await dispatch(restoreSnapshotRecord(fresh));
            dispatch(complectVariantActions.setOpenVariant(variantSmartId));
            await dispatch(
                saveComplectComposition({ openVariantSmartId: variantSmartId }),
            );
            // слепок сделки повторяет открытый вариант: так перезагрузка
            // страницы поднимает то же состояние, на которое указывает настройка
            await dispatch(saveSnapshot());
            return true;
        } catch (error) {
            dispatch(
                complectVariantActions.actionFailed(
                    errorText(error, 'вариант не открыт'),
                ),
            );
            return false;
        } finally {
            dispatch(complectVariantActions.busy(false));
        }
    };

/**
 * Закрыть вариант: дальше сохранение идёт только в саму сделку. Правки
 * варианта записываются до закрытия; не удалось — вариант остаётся открытым,
 * ошибка показана. Возвращает, закрылся ли вариант.
 */
export const closeComplectVariant =
    (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
        dispatch(complectVariantActions.clearError());
        dispatch(complectVariantActions.busy(true));
        try {
            const isSaved = await dispatch(syncOpenComplectVariant());
            if (!isSaved) {
                dispatch(
                    complectVariantActions.actionFailed(
                        saveBeforeLeaveFailure(
                            'закрыт',
                            getState().complectVariant.error,
                        ),
                    ),
                );
                return false;
            }
            dispatch(complectVariantActions.setOpenVariant(null));
            await dispatch(
                saveComplectComposition({ openVariantSmartId: null }),
            );
            return true;
        } finally {
            dispatch(complectVariantActions.busy(false));
        }
    };

/**
 * Сохранение сделки при открытом варианте пишет и в вариант — менеджеру не
 * нужна отдельная кнопка. Вызывается слушателем после saveSnapshot и перед
 * уходом из варианта (переключение, закрытие).
 *
 * Запись, которую вернул сервер, попадает в список вариантов: повторное
 * открытие и КП по неоткрытым вариантам берут слепки из него.
 *
 * Возвращает true, когда терять нечего: вариант записан либо писать некуда
 * (вариант не открыт) или нечего (в конструкторе ещё нет строк). false —
 * сервер отказал, правки остались только в памяти; ошибка уже в слайсе.
 */
export const syncOpenComplectVariant =
    (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
        const state = getState();
        const variantSmartId = state.complectVariant.openVariantSmartId;
        if (!variantSmartId) return true;
        const snapshot = buildCurrentSnapshotV2(state);
        if (!snapshot) return true;
        try {
            const saved = await helper.saveRecord(snapshot, variantSmartId);
            dispatch(complectVariantActions.upsertRecord(saved));
            return true;
        } catch (error) {
            dispatch(
                complectVariantActions.actionFailed(
                    errorText(error, 'вариант не обновлён'),
                ),
            );
            return false;
        }
    };

/**
 * Удалить вариант насовсем: сначала запись в базе конструктора, при успехе —
 * элемент смарта в Битриксе, затем список вариантов перечитывается.
 *
 * Порядок важен. Запись в базе первая: если сервер отказал, в Битриксе
 * ничего не тронуто и вариант остаётся целым. Если Битрикс отказал уже
 * после базы, вариант из конструктора ушёл, элемент остался: итог
 * `bitrix-failed`, человек удалит его в смарте руками.
 *
 * Сбой здесь не пишется в `error` слайса: итог возвращается вызывающему, и
 * экран реагирует по нему (уведомление). Список вариантов при сбое остаётся
 * на экране.
 *
 * Открытый в редакторе вариант не удаляется: он получает правки сделки.
 */
export const deleteComplectVariant =
    (variantSmartId: number): AppThunk<Promise<ComplectVariantDeleteResult>> =>
    async (dispatch, getState) => {
        const state = getState();
        const { dealId, domain } = state.app;
        const entityTypeId = getComplectVariantPbxSmartEntityId(
            state.portal.current,
        );
        if (!dealId || !domain || !entityTypeId) {
            return {
                status: 'failed',
                message: 'сделка или смарт «Варианты комплекта» недоступны',
            };
        }
        if (
            !isVariantDeletable(
                variantSmartId,
                state.complectVariant.openVariantSmartId,
            )
        ) {
            return { status: 'blocked' };
        }

        dispatch(complectVariantActions.clearError());
        dispatch(complectVariantActions.busy(true));
        try {
            try {
                await helper.deleteRecord({ domain, dealId, variantSmartId });
            } catch (error) {
                return {
                    status: 'failed',
                    message: readDeleteErrorMessage(
                        error,
                        'сервер не удалил вариант',
                    ),
                };
            }

            let result: ComplectVariantDeleteResult = { status: 'deleted' };
            try {
                await helper.deleteItem(entityTypeId, variantSmartId);
            } catch (error) {
                result = {
                    status: 'bitrix-failed',
                    message: readDeleteErrorMessage(
                        error,
                        'Битрикс не удалил элемент',
                    ),
                };
            }

            await dispatch(fetchComplectVariants());
            return result;
        } finally {
            dispatch(complectVariantActions.busy(false));
        }
    };

/**
 * Стадия варианта: «Текущий» отмечает вариант в работу, «Отклонён» выводит его
 * из документов и из переезда в отдел сервиса; кнопками менеджер ставит только
 * эти две, остальные стадии выставляет бэк. Стадию считаем от текущего stageId
 * элемента: категорию смарта угадывать нельзя.
 */
export const setComplectVariantStage =
    (variantSmartId: number, stage: ComplectVariantStage): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const entityTypeId = getComplectVariantPbxSmartEntityId(
            state.portal.current,
        );
        const item = state.complectVariant.items.find(
            candidate => candidate.id === variantSmartId,
        );
        const stageId = buildVariantStageId(item?.stageId, stage);
        if (!entityTypeId || !stageId) {
            dispatch(
                complectVariantActions.actionFailed('стадия варианта не построена'),
            );
            return;
        }

        dispatch(complectVariantActions.clearError());
        dispatch(complectVariantActions.busy(true));
        try {
            await helper.updateItemStage(entityTypeId, variantSmartId, stageId);
            await dispatch(fetchComplectVariants());
        } catch (error) {
            dispatch(
                complectVariantActions.actionFailed(
                    errorText(error, 'стадия варианта не изменена'),
                ),
            );
            dispatch(complectVariantActions.busy(false));
        }
    };
