/**
 * Реестр кадров — это и задание на съёмку, и места загрузки в админке, и то,
 * что видит клиент. Расхождения тихие: кадр без места снимут зря, место без
 * кадра не заметят, админка разложит место не на ту страницу, а SHOTS.md,
 * отставший от реестра, отправит владельца снимать не то.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PLATFORM_SHOT_PAGES, platformShotPage } from '@workspace/site-media';
import { PLATFORM_ROOT, platformServiceHref } from '../model/navigation';
import { PLATFORM_SERVICES } from '../model/services';
import { PLATFORM_SHOTS, type PlatformShotId } from '../model/shots';
import { renderShotList } from './support/render-shot-list';
import { collectShotUsage, shotsOfService } from './support/shot-usage';

const SECTION_DIR = resolve(__dirname, '..');
const SHOT_LIST_PATH = resolve(SECTION_DIR, 'SHOTS.md');

const SHOT_IDS = Object.keys(PLATFORM_SHOTS) as PlatformShotId[];
const usage = collectShotUsage();

describe('реестр кадров', () => {
    it('каждый кадр где-то стоит — иначе его снимут зря', () => {
        const orphans = SHOT_IDS.filter(id => !usage.has(id));
        expect(orphans).toEqual([]);
    });

    it('на одной странице кадр не повторяется', () => {
        for (const service of PLATFORM_SERVICES) {
            const ids = shotsOfService(service);
            expect(new Set(ids).size, service.slug).toBe(ids.length);
        }
    });

    it('подписи для клиента заполнены', () => {
        for (const id of SHOT_IDS) {
            expect(PLATFORM_SHOTS[id].caption.trim(), id).not.toBe('');
        }
    });
});

describe('страницы кадров в админке', () => {
    it('админка кладёт кадр на ту страницу, где он стоит на сайте', () => {
        for (const id of SHOT_IDS) {
            const page = platformShotPage(id);
            expect(page, id).toBeDefined();
            expect(usage.get(id), id).toContain(page?.path);
        }
    });

    it('названия и адреса страниц — как у сайта', () => {
        const hub = PLATFORM_SHOT_PAGES.find(page => page.path === PLATFORM_ROOT);
        expect(hub).toBeDefined();
        for (const service of PLATFORM_SERVICES) {
            const page = PLATFORM_SHOT_PAGES.find(item => item.path === platformServiceHref(service.slug));
            expect(page?.title, service.slug).toBe(service.name);
        }
        expect(PLATFORM_SHOT_PAGES).toHaveLength(PLATFORM_SERVICES.length + 1);
    });
});

describe('SHOTS.md', () => {
    it('совпадает с реестром', () => {
        const expected = renderShotList(PLATFORM_SHOTS, usage);
        // eslint-disable-next-line turbo/no-undeclared-env-vars -- ручной флаг пересборки SHOTS.md, в сборку не попадает
        if (process.env.UPDATE_SHOTS === '1') {
            writeFileSync(SHOT_LIST_PATH, expected, 'utf8');
        }
        const actual = existsSync(SHOT_LIST_PATH) ? readFileSync(SHOT_LIST_PATH, 'utf8') : '';
        expect(actual.replace(/\r\n/g, '\n')).toBe(expected);
    });
});
