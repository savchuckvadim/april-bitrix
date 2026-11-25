import { describe, expect, it } from 'vitest';
import {
    buildCallsListSearch,
    defaultCallsListQuery,
    parseCallsListQuery,
    patchCallsListQuery,
} from '../lib/calls-list-query';
import {
    canonicalCallsListSearch,
    settleCallsListUrlWrite,
} from '../lib/calls-list-url-sync';

/*
 * Адрес страницы — зеркало фильтров и обновляется с задержкой. Страница
 * должна отличать свою запись в адрес от смены адреса извне, иначе быстрые
 * нажатия подряд затирают друг друга, а «назад» по истории не меняет фильтры.
 */

const TODAY = new Date(2026, 10, 25);

describe('canonicalCallsListSearch — один вид строки параметров', () => {
    it('ведущий «?» не важен', () => {
        expect(canonicalCallsListSearch('?badges=no_step')).toBe(
            canonicalCallsListSearch('badges=no_step'),
        );
    });

    it('пустая строка и «?» — одно и то же', () => {
        expect(canonicalCallsListSearch('')).toBe('');
        expect(canonicalCallsListSearch('?')).toBe('');
    });

    it('разная кодировка одного значения сводится к одной', () => {
        expect(canonicalCallsListSearch('badges=no_step,no_price')).toBe(
            canonicalCallsListSearch('badges=no_step%2Cno_price'),
        );
    });

    it('адрес, собранный из фильтров, уже в каноническом виде', () => {
        const query = patchCallsListQuery(defaultCallsListQuery(TODAY), {
            badges: ['no_step', 'no_price'],
        });
        const search = buildCallsListSearch(query, TODAY);
        expect(canonicalCallsListSearch(search)).toBe(search.slice(1));
    });
});

describe('settleCallsListUrlWrite — своя запись или чужой адрес', () => {
    it('адрес совпал с единственной записью — она дошла, ждать нечего', () => {
        expect(settleCallsListUrlWrite(['badges=a'], 'badges=a')).toEqual([]);
    });

    it('дошла первая из двух быстрых записей — вторая ещё в пути', () => {
        expect(
            settleCallsListUrlWrite(['badges=a', 'badges=a%2Cb'], 'badges=a'),
        ).toEqual(['badges=a%2Cb']);
    });

    it('дошла сразу последняя запись — более ранние уже не придут', () => {
        expect(
            settleCallsListUrlWrite(
                ['badges=a', 'badges=a%2Cb', 'badges=a%2Cb%2Cc'],
                'badges=a%2Cb%2Cc',
            ),
        ).toEqual([]);
    });

    it('включили, выключили и снова включили — берётся последнее совпадение', () => {
        expect(
            settleCallsListUrlWrite(['badges=a', '', 'badges=a'], 'badges=a'),
        ).toEqual([]);
    });

    it('адрес с «?» и в другой кодировке — та же запись', () => {
        expect(
            settleCallsListUrlWrite(['badges=a%2Cb'], '?badges=a,b'),
        ).toEqual([]);
    });

    it('адреса нет среди записей — его сменили не мы', () => {
        expect(settleCallsListUrlWrite(['badges=a'], 'badges=z')).toBeNull();
    });

    it('своих записей нет — любой адрес чужой (шаг по истории окна)', () => {
        expect(settleCallsListUrlWrite([], 'badges=a')).toBeNull();
        expect(settleCallsListUrlWrite([], '')).toBeNull();
    });

    it('сброс фильтров — своя запись с пустым адресом', () => {
        expect(settleCallsListUrlWrite(['badges=a', ''], '')).toEqual([]);
    });
});

describe('быстрые нажатия подряд — правки складываются', () => {
    it('два бейджа, нажатые до обновления адреса, остаются оба', () => {
        // Фильтры страницы — её состояние: вторая правка идёт поверх первой,
        // а не поверх фильтров из ещё не обновившегося адреса.
        const start = defaultCallsListQuery(TODAY);
        const first = patchCallsListQuery(start, { badges: ['no_step'] });
        const second = patchCallsListQuery(first, {
            badges: [...first.badges, 'no_price'],
        });
        const pending = [first, second].map(query =>
            canonicalCallsListSearch(buildCallsListSearch(query, TODAY)),
        );

        // До адреса доходит первая запись — состояние страницы не откатывается.
        const afterFirst = settleCallsListUrlWrite(
            pending,
            buildCallsListSearch(first, TODAY),
        );
        expect(afterFirst).toEqual([pending[1]]);

        // Затем вторая: адрес и состояние сошлись.
        const afterSecond = settleCallsListUrlWrite(
            afterFirst ?? [],
            buildCallsListSearch(second, TODAY),
        );
        expect(afterSecond).toEqual([]);
        expect(
            parseCallsListQuery(buildCallsListSearch(second, TODAY), TODAY).badges,
        ).toEqual(['no_step', 'no_price']);
    });
});
