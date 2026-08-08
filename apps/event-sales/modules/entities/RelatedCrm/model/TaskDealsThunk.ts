import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    BoundDealRow,
    RawStatusRow,
    StageDictItem,
    buildStageDict,
    dealStageEntityId,
    mapBoundDeal,
} from '../lib/bound-deal-view';
import { taskDealsActions } from './TaskDealsSlice';

const DEAL_SELECT = [
    'ID', 'TITLE', 'STAGE_ID', 'CATEGORY_ID', 'OPPORTUNITY', 'CLOSED',
    'DATE_CREATE',
];

/** Запросы словарей, которые уже в полёте — не дублируем параллельные. */
const stageDictInflight = new Map<string, Promise<StageDictItem[]>>();

const requestStageDict = async (entityId: string): Promise<StageDictItem[]> => {
    const response = await Bitrix.getService().status.getList({
        ENTITY_ID: entityId,
    });
    return buildStageDict((response?.result ?? []) as RawStatusRow[]);
};

/**
 * Догружает недостающие словари стадий воронок в слайс (кэш на сессию:
 * воронки за время открытого фрейма не меняются). Нужен и привязанным
 * сделкам (позиция стадии), и посегментным тултипам полосок — в том числе
 * для сделок из графа клиента.
 */
export const ensureStageDicts =
    (entityIds: string[]) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const loaded = getState().taskDeals.stageDicts;
        const missing = [...new Set(entityIds)].filter(
            entityId =>
                entityId && !loaded[entityId] && !stageDictInflight.has(entityId),
        );
        if (!missing.length) return;

        await Promise.all(
            missing.map(async entityId => {
                const request = requestStageDict(entityId);
                stageDictInflight.set(entityId, request);
                try {
                    const dict = await request;
                    dispatch(taskDealsActions.setStageDict({ entityId, dict }));
                } catch (error) {
                    console.error('ensureStageDicts error', entityId, error);
                } finally {
                    stageDictInflight.delete(entityId);
                }
            }),
        );
    };

/**
 * Загрузка открытых сделок, привязанных к задачам обзвона.
 *
 * Граф связей клиента (duplicates/details) о них может не знать: старые
 * сделки создавались без LEAD_ID/компании, и единственная ниточка к ним —
 * привязка в самой задаче. Здесь они дотягиваются напрямую из портала:
 * crm.deal.list по id + словарь стадий воронки (crm.status.list), чтобы
 * полоска знала позицию «стадия N из M».
 *
 * Ошибка не фатальна: полоски привязанных просто не появятся, карточки
 * продолжают работать.
 */
export const fetchTaskBoundDeals =
    (dealIds: number[]) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const requested = new Set(getState().taskDeals.requestedIds);
        const ids = [...new Set(dealIds)].filter(
            id => Number.isFinite(id) && id > 0 && !requested.has(id),
        );
        if (!ids.length) return;

        dispatch(taskDealsActions.markRequested({ ids }));

        try {
            const bitrix = Bitrix.getService();
            // Привязок у задач одного клиента единицы — в страницу
            // crm.deal.list (50) укладываемся всегда.
            const response = await bitrix.deal.getList(
                { ID: ids, CLOSED: 'N' } as never,
                DEAL_SELECT,
            );
            const rows = (response?.result ?? []) as BoundDealRow[];
            if (!rows.length) return;

            const entityIds = rows.map(row => dealStageEntityId(row.CATEGORY_ID));
            await dispatch(ensureStageDicts(entityIds));
            const dicts = getState().taskDeals.stageDicts;

            dispatch(
                taskDealsActions.setDeals({
                    deals: rows.map(row =>
                        mapBoundDeal(
                            row,
                            dicts[dealStageEntityId(row.CATEGORY_ID)],
                        ),
                    ),
                }),
            );
        } catch (error) {
            console.error('fetchTaskBoundDeals error', error);
        }
    };
