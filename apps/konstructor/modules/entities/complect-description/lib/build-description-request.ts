import type { RootState } from '@/modules/app/model/store';
import { resolveSupply, selectCatalog } from '../../catalog';
import { buildComplectGroups } from '../../document-payload';
import { findMainRow } from '../../row-set';
import type { ComplectDescriptionGroup, ComplectDescriptionRequest } from '../model/dto';

/**
 * Запрос описания из наполнения главной строки: те же группы, что идут в КП
 * (buildComplectGroups), блоки — code + имя для документа + описание из
 * каталога (бэк предпочтёт свою БД, фронтовый текст — запас для сервисов).
 */

/** Почему описание сейчас не собрать */
export const complectDescriptionBlocker = (state: RootState): string | null => {
    const main = findMainRow(state.rowSet.general);
    if (!main?.composition) return 'Сначала соберите главный товар';
    if (!state.app.domain) return 'Нет домена портала';
    return null;
};

export const buildComplectDescriptionRequest = (state: RootState): ComplectDescriptionRequest | null => {
    if (complectDescriptionBlocker(state)) return null;
    const catalog = selectCatalog(state);
    const main = findMainRow(state.rowSet.general);
    if (!main?.composition) return null;

    const complect = catalog.complects.byCode[main.refs.complectCode ?? ''];
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    const groups: ComplectDescriptionGroup[] = buildComplectGroups(catalog, main.composition).map(group => ({
        name: group.groupsName,
        infoblocks: group.value.map(block => ({
            code: block.code ?? block.name,
            name: block.title ?? block.name,
            description: block.description ?? null,
        })),
    }));

    return {
        domain: state.app.domain,
        userId: Number(state.app.bitrix.user?.ID) || 0,
        complectName: complect?.fullTitle ?? main.names.name,
        supply: supply?.quantityForKp ?? supply?.name ?? '',
        groups,
    };
};
