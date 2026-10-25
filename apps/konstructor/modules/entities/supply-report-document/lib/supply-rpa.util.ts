import type { IBxRpaStage } from '@workspace/bitrix';
// чистый модуль, не баррель: баррель portal тянет хуки → app → UI (react-pdf в тестах)
import { getRpaFieldId, getRpaSupplyTypeId } from '../../portal/lib/portal-util';
import type { Portal } from '../../portal/model/dto';

/** Фильтр rpa.item.list: заявки сделки, не закрытые (легаси getRpaStagesFilter). */
export const buildSupplyRpaFilter = (
    portal: Portal,
    dealId: number,
    stages: IBxRpaStage[],
): { typeId: number; filter: Record<string, unknown> } | null => {
    const typeId = getRpaSupplyTypeId(portal);
    if (!typeId) return null;
    const filter: Record<string, unknown> = {
        [getRpaFieldId(portal, typeId, 'rpa_crm_base_deal')]: dealId,
    };
    const closed = stages.filter(stage => stage.isSuccess || stage.isFail);
    if (closed.length) {
        filter.logic = 'and';
        closed.forEach((stage, index) => {
            filter[index] = { '!=stageId': stage.id };
        });
    }
    return { typeId, filter };
};

/** Первая открытая заявка — её init-supply обновит, иначе создаст новую. */
export const pickSupplyRpaId = (items: Array<{ id?: number | string }>): number | null => {
    const first = items[0];
    const id = Number(first?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
};
