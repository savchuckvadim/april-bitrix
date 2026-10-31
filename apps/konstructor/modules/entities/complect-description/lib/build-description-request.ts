import type { RootState } from '@/modules/app/model/store';
import { resolveSupply, selectCatalog } from '../../catalog';
import { buildComplectGroups, docComposition } from '../../document-payload';
import { findMainRow } from '../../row-set';
import type { ComplectDescriptionContent, ComplectDescriptionGroup } from '../model/dto';

/**
 * Запрос описания из наполнения главной строки: те же группы, что идут в КП
 * (buildComplectGroups), блоки — code + имя для документа + описание из
 * каталога (бэк предпочтёт свою БД, фронтовый текст — запас для сервисов).
 */

type DescriptionState = Pick<RootState, 'catalog' | 'rowSet'>;

/** Почему описание сейчас не собрать */
export const complectDescriptionBlocker = (state: DescriptionState): string | null => {
    const main = findMainRow(state.rowSet.general);
    return main?.composition ? null : 'Сначала соберите главный товар';
};

export const buildComplectDescriptionContent = (
    state: DescriptionState,
): ComplectDescriptionContent | null => {
    const catalog = selectCatalog(state);
    const main = findMainRow(state.rowSet.general);
    const composition = main && docComposition(main, state.rowSet.general);
    if (!main || !composition) return null;

    const complect = catalog.complects.byCode[main.refs.complectCode ?? ''];
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    const groups: ComplectDescriptionGroup[] = buildComplectGroups(catalog, composition).map(group => ({
        name: group.groupsName,
        infoblocks: group.value.map(block => ({
            code: block.code ?? block.name,
            name: block.title ?? block.name,
            description: block.description ?? null,
        })),
    }));

    return {
        complectName: complect?.fullTitle ?? main.names.name,
        supply: supply?.quantityForKp ?? supply?.name ?? '',
        groups,
    };
};
