import type { RootState } from '@/modules/app/model/store';
// прямой путь, мимо барреля с UI: селектор читают шапка и слушатели оболочки
import { getRqInn } from '@/modules/entities/bx-rq/lib/rq-inn.util';
import { buildInnSyncPlan } from '../lib/build-inn-sync-plan.util';
import type { InnSyncPlan } from './types';

type Entity = Record<string, unknown> | null;

/**
 * ИНН текущего сохранённого реквизита: от него зависят и шапка, и запись в
 * сделку с компанией. Единственный селектор «чей ИНН сейчас текущий».
 */
export const selectCurrentRequisiteInn = (state: RootState): string | null =>
    getRqInn(state.bxrq.current.item);

/** Что записать, чтобы ИНН сделки и компании стал ИНН текущего реквизита; null — делать нечего. */
export const selectInnSyncPlan = (state: RootState): InnSyncPlan | null =>
    buildInnSyncPlan({
        requisiteInn: selectCurrentRequisiteInn(state),
        domain: state.app.domain || null,
        userId: Number(state.app.bitrix.user?.ID) || null,
        deal: state.app.bitrix.deal as unknown as Entity,
        dealFields: state.portal.current?.bitrixDeal?.bitrixfields,
        company: state.app.bitrix.company as unknown as Entity,
        companyFields: state.portal.current?.company?.bitrixfields,
    });
