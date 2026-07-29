import type { AppThunk } from '@/modules/app/model/store';
import { rowSetActions, findMainRow } from '../../row-set';
import { parseV1, hasDealData } from '../lib/v1/parse-v1';
import { mapV1 } from '../lib/v1/map-v1';
import { restoreV2, serializeV2 } from '../lib/v2/serialize';
import { isSnapshotV2 } from './types';
import type { RestoredState } from './types';
import type { V1Record } from '../lib/v1/types';
import { SnapshotHelper, hasSnapshotApi } from '../lib/api/snapshot-helper';
import { snapshotActions } from './SnapshotSlice';

const snapshotHelper = new SnapshotHelper();

/** v2-слепок хранится сериализованным в колонке rows (schemaVersion: 2) */
const tryParseV2 = (record: V1Record) => {
    if (!record.rows) return null;
    try {
        const parsed = JSON.parse(record.rows) as unknown;
        return isSnapshotV2(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

/**
 * Вспоминание сделки: fetch слепка → v1-адаптер (или restore v2) → стейт.
 * ПОРЯДОК КРИТИЧЕН: setContext ДО restore — sync-listener матчит setContext,
 * но НЕ матчит restore, поэтому сохранённые (денормализованные) цены
 * НЕ пересчитываются (требование BC, docs/legacy-persistence.md §5.4).
 *
 * fallbackRecord — dev-фикстура: политика её использования у app-слоя
 * (listener), entity о константах приложения не знает.
 */
export const restoreSnapshot =
    ({
        domain,
        dealId,
        fallbackRecord = null,
    }: {
        domain: string;
        dealId: number;
        fallbackRecord?: V1Record | null;
    }): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(snapshotActions.started());
        try {
            let record: V1Record | null;
            if (hasSnapshotApi) {
                try {
                    record = await snapshotHelper.getSnapshot(domain, dealId);
                } catch (error) {
                    // API недоступен (бэк не запущен / прод без эндпоинтов):
                    // в dev продолжаем на фикстуре, иначе — error-статус
                    if (!fallbackRecord) throw error;
                    console.warn(
                        'snapshot API недоступен — dev-фикстура',
                        error,
                    );
                    record = fallbackRecord;
                }
            } else {
                record = fallbackRecord;
            }
            if (!record) {
                dispatch(snapshotActions.none());
                return;
            }

            const catalog = getState().catalog.catalog;
            let restored: RestoredState;
            const v2 = tryParseV2(record);
            if (v2) {
                restored = restoreV2(v2);
            } else {
                const parsed = parseV1(record);
                if (!hasDealData(parsed)) {
                    dispatch(snapshotActions.none());
                    return;
                }
                // mapV1 сам добавляет parseErrors в warnings
                restored = mapV1(parsed, catalog);
            }

            if (restored.regionCode) {
                dispatch(
                    rowSetActions.setContext({
                        regionCode: restored.regionCode,
                    }),
                );
            }
            dispatch(
                rowSetActions.restore({
                    general: restored.general,
                    alternative: restored.alternative,
                }),
            );
            const main = findMainRow(restored.general);
            dispatch(rowSetActions.selectRow(main?.key ?? null));
            dispatch(
                snapshotActions.restored({
                    warnings: restored.warnings,
                    templateId: restored.templateId,
                }),
            );
        } catch (error) {
            dispatch(
                snapshotActions.failed(
                    error instanceof Error
                        ? error.message
                        : 'snapshot restore failed',
                ),
            );
        }
    };

/**
 * Сохранение текущего состояния как слепка v2 (POST upsert по domain+dealId).
 * Возвращает успех — UI показывает «Сохранено» ПО ФАКТУ ответа (front-refactor).
 * v1-запись перезаписывается v2-форматом; чтение поддерживает оба.
 */
export const saveSnapshot =
    (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
        const state = getState();
        const { dealId, domain } = state.app;
        const user = state.app.bitrix.user;
        const { general, alternative, context } = state.rowSet;

        if (!dealId || !domain) {
            dispatch(snapshotActions.saveFailed('Сделка не определена'));
            return false;
        }
        if (!general.rows.length) {
            dispatch(snapshotActions.saveFailed('Нечего сохранять'));
            return false;
        }

        dispatch(snapshotActions.saveStarted());
        try {
            const main = findMainRow(general);
            const snapshot = serializeV2({
                state: {
                    regionCode: context.regionCode,
                    contractCode: main?.refs.contractCode ?? null,
                    supplyCode: main?.refs.supplyCode ?? null,
                    general,
                    alternative,
                    templateId: state.snapshot.templateId,
                },
                dealId,
                domain,
                userId: user ? Number(user.ID) || null : null,
                savedAt: new Date().toISOString(),
            });
            await snapshotHelper.saveSnapshot(snapshot);
            dispatch(snapshotActions.saveDone());
            return true;
        } catch (error) {
            dispatch(
                snapshotActions.saveFailed(
                    error instanceof Error
                        ? error.message
                        : 'snapshot save failed',
                ),
            );
            return false;
        }
    };
