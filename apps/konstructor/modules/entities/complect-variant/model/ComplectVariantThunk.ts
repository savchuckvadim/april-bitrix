import type { AppThunk } from '@/modules/app/model/store';
import { getComplectVariantPbxSmartEntityId } from '../../portal';
import {
    buildCurrentSnapshotV2,
    restoreSnapshotRecord,
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

            // элементы Битрикса успели отказать — вариантов нет, открывать нечего
            if (getState().complectVariant.status !== 'ready') return;

            const openId = composition?.openVariantSmartId ?? null;
            const isKnown =
                openId !== null &&
                records.some(record => record.variantSmartId === openId);
            dispatch(
                complectVariantActions.setOpenVariant(isKnown ? openId : null),
            );
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

        dispatch(complectVariantActions.setComposition(composition));
        try {
            await helper.saveComposition(domain, dealId, composition);
        } catch (error) {
            // не сохранилось — возвращаем прежнее, чтобы экран не показывал
            // выбор, которого нет в базе
            dispatch(complectVariantActions.setComposition(previous));
            dispatch(
                complectVariantActions.failed(
                    errorText(error, 'настройки сборки не сохранены'),
                ),
            );
        }
    };

/**
 * Новый вариант из текущего состояния: элемент смарта плюс слепок v2.
 * Состояние сделки не трогается — в том и смысл вариантов. Созданный вариант
 * сразу становится открытым: дальше правки идут в него.
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
            dispatch(complectVariantActions.failed('Нечего сохранять'));
            return;
        }

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
                complectVariantActions.failed(
                    errorText(error, 'вариант не создан'),
                ),
            );
        }
    };

/**
 * Открыть вариант: его запись раскладывается по стейту тем же путём, что и
 * слепок сделки. Пока вариант открыт, сохранение сделки пишет и в него.
 * Возвращает, открылся ли вариант, — переход экрана делается по факту.
 */
export const openComplectVariant =
    (record: ComplectVariantRecordDto): AppThunk<Promise<boolean>> =>
    async dispatch => {
        dispatch(complectVariantActions.busy(true));
        try {
            await dispatch(restoreSnapshotRecord(record));
            dispatch(complectVariantActions.setOpenVariant(record.variantSmartId));
            await dispatch(
                saveComplectComposition({
                    openVariantSmartId: record.variantSmartId,
                }),
            );
            return true;
        } catch (error) {
            dispatch(
                complectVariantActions.failed(
                    errorText(error, 'вариант не открыт'),
                ),
            );
            return false;
        } finally {
            dispatch(complectVariantActions.busy(false));
        }
    };

/** Закрыть вариант: дальше сохранение идёт только в саму сделку. */
export const closeComplectVariant =
    (): AppThunk<Promise<void>> => async dispatch => {
        dispatch(complectVariantActions.setOpenVariant(null));
        await dispatch(saveComplectComposition({ openVariantSmartId: null }));
    };

/**
 * Сохранение сделки при открытом варианте пишет и в вариант — менеджеру не
 * нужна отдельная кнопка. Вызывается слушателем после saveSnapshot.
 */
export const syncOpenComplectVariant =
    (): AppThunk<Promise<void>> => async (dispatch, getState) => {
        const state = getState();
        const variantSmartId = state.complectVariant.openVariantSmartId;
        if (!variantSmartId) return;
        const snapshot = buildCurrentSnapshotV2(state);
        if (!snapshot) return;
        try {
            await helper.saveRecord(snapshot, variantSmartId);
        } catch (error) {
            dispatch(
                complectVariantActions.failed(
                    errorText(error, 'вариант не обновлён'),
                ),
            );
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
 * Сбой здесь не пишется в `failed` слайса: оно прячет все варианты, и из-за
 * неудавшегося удаления скрывать остальные незачем. Итог возвращается
 * вызывающему, и экран реагирует по нему (уведомление).
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
 * Стадия варианта: «Текущий» — участвует в сделке, «Отклонён» — не участвует
 * и не переезжает в отдел сервиса. Стадию считаем от текущего stageId
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
            dispatch(complectVariantActions.failed('стадия варианта не построена'));
            return;
        }

        dispatch(complectVariantActions.busy(true));
        try {
            await helper.updateItemStage(entityTypeId, variantSmartId, stageId);
            await dispatch(fetchComplectVariants());
        } catch (error) {
            dispatch(
                complectVariantActions.failed(
                    errorText(error, 'стадия варианта не изменена'),
                ),
            );
        }
    };
