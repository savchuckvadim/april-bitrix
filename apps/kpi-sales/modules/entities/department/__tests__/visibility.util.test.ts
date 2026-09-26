import { describe, expect, it } from 'vitest';
import {
    HEAD_OF_SOURCE_SUFFIX,
    visibilityLabel,
} from '../lib/utils/visibility.util';
import type { CurrentUserInfo, HeadOfSource } from '../model';
import { makeCurrentUser, makeSuperUser } from './department-fixtures';

describe('visibilityLabel — подпись роли в баннере «Смотреть как…»', () => {
    it('роль по структуре — без пометки', () => {
        expect(
            visibilityLabel(
                makeCurrentUser({ visibility: 'group', headOf: 'group' }),
            ),
        ).toBe('руководитель группы');
    });

    it('роль по настройке портала — с пометкой', () => {
        expect(
            visibilityLabel(
                makeCurrentUser({
                    visibility: 'department',
                    headOf: 'op',
                    headOfSource: 'settings',
                }),
            ),
        ).toBe('руководитель отдела (по настройке портала)');
    });

    it('суперпользователь вендора — с пометкой', () => {
        expect(visibilityLabel(makeSuperUser())).toBe(
            'руководитель направления (суперпользователь)',
        );
    });

    it('источника нет (снимки v: 1, старый бэк) — без пометки', () => {
        const legacy = { headOf: 'op' } as unknown as CurrentUserInfo;
        expect(visibilityLabel(legacy)).toBe('руководитель отдела');
        expect(visibilityLabel(null)).toBe('менеджер');
    });

    it('неизвестный источник от бэка новее фронта — без пометки', () => {
        const future = makeCurrentUser({
            headOfSource: 'future' as HeadOfSource,
        });
        expect(visibilityLabel(future)).toBe('менеджер');
    });

    it('пометка задана для каждого источника', () => {
        expect(Object.keys(HEAD_OF_SOURCE_SUFFIX).sort()).toEqual([
            'settings',
            'structure',
            'superuser',
        ]);
    });
});
