import { describe, expect, it } from 'vitest';
import { catalogActions, catalogReducer } from '../../../catalog';
import {
    catalog,
    compositionOf,
    garantRowOf,
    syncedGeneral,
} from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { rowSetActions, rowSetReducer, type RowSet } from '../../../row-set';
import { buildComplectDescriptionContent } from '../build-description-request';

/**
 * Описание комплекта собирается из наполнения одной главной строки: наполнение
 * дополнительных комплектов набора в запрос не входит (решение этой задачи:
 * описание относится к главному товару, см. комментарий запроса).
 */

const stateOf = (general: RowSet) => ({
    catalog: catalogReducer(undefined, catalogActions.setCatalog(catalog)),
    rowSet: rowSetReducer(undefined, rowSetActions.writeSyncedSet(general)),
});

const main = garantRowOf(
    'general_main',
    'main',
    'buh',
    compositionOf('buh', { infoblocks: ['rus', 'reg', 'bbu'], lt: ['ltsut'], regions: ['stv'] }),
);
const additional = garantRowOf(
    'general_additional',
    'additional',
    'ur',
    compositionOf('ur', { infoblocks: ['rus', 'la', 'ntss'], regions: ['spb'], consalting: 'sovex' }),
);

const codesOf = (general: RowSet): string[] =>
    (buildComplectDescriptionContent(stateOf(general))?.groups ?? []).flatMap(group =>
        group.infoblocks.map(block => block.code),
    );

describe('описание комплекта: наполнение главной строки', () => {
    it('в запросе блоки главной строки, дополнительные комплекты набора не добавляются', () => {
        const codes = codesOf(syncedGeneral([main, additional]));
        expect(codes).toEqual(expect.arrayContaining(['rus', 'reg', 'bbu', 'stv', 'ltsut']));
        expect(codes).not.toContain('la');
        expect(codes).not.toContain('ntss');
        expect(codes).not.toContain('spb');
        expect(codes).not.toContain('sovex');
    });

    it('запрос набора с дополнительной строкой равен запросу набора из одной главной строки', () => {
        expect(buildComplectDescriptionContent(stateOf(syncedGeneral([main, additional])))).toEqual(
            buildComplectDescriptionContent(stateOf(syncedGeneral([main]))),
        );
    });

    it('название комплекта и поставка — главной строки', () => {
        const content = buildComplectDescriptionContent(stateOf(syncedGeneral([main, additional])));
        expect(content?.complectName).toBe(catalog.complects.byCode['buh']!.fullTitle);
    });

    it('у главной строки нет наполнения — запроса нет', () => {
        const bare = garantRowOf('general_main', 'main', 'buh', undefined);
        expect(buildComplectDescriptionContent(stateOf(syncedGeneral([bare, additional])))).toBeNull();
    });
});
