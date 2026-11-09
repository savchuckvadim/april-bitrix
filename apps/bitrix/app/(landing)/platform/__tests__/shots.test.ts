/**
 * Реестр кадров — это и задание на съёмку, и то, что видит клиент.
 * Расхождения тихие: кадр без места снимут зря, место без кадра не заметят,
 * а SHOTS.md, отставший от реестра, отправит владельца снимать не то.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PLATFORM_SERVICES } from '../model/services';
import { PLATFORM_SHOTS, type PlatformShotId } from '../model/shots';
import { resolveShotMedia } from '../lib/shot-files';
import { renderShotList } from './support/render-shot-list';
import { collectShotUsage, shotsOfService } from './support/shot-usage';

const SECTION_DIR = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(__dirname, '..', '..', '..', '..', 'public');
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

    it('src в реестре, если задан, ведёт в public/platform', () => {
        for (const id of SHOT_IDS) {
            const { src, poster } = PLATFORM_SHOTS[id];
            for (const file of [src, poster]) {
                if (!file) continue;
                expect(file.startsWith('/platform/'), id).toBe(true);
                expect(existsSync(resolve(PUBLIC_DIR, `.${file}`)), `${id}: ${file}`).toBe(true);
            }
        }
    });

    it('подписи для клиента заполнены', () => {
        for (const id of SHOT_IDS) {
            expect(PLATFORM_SHOTS[id].caption.trim(), id).not.toBe('');
        }
    });
});

describe('кадры по имени файла', () => {
    const withPublic = (files: string[]) => {
        const root = mkdtempSync(join(tmpdir(), 'platform-shots-'));
        for (const file of files) {
            const path = join(root, file);
            mkdirSync(join(path, '..'), { recursive: true });
            writeFileSync(path, '');
        }
        return root;
    };

    it('скрин подхватывается по имени файла, без правки реестра', () => {
        const root = withPublic(['platform/shots/calls-form.webp']);
        try {
            expect(resolveShotMedia('calls-form', [root])).toEqual({ src: '/platform/shots/calls-form.webp' });
            expect(resolveShotMedia('kpi-all-tab', [root])).toEqual({});
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('регистр расширения не важен, адрес — с настоящим именем файла', () => {
        const root = withPublic(['platform/shots/calls-form.PNG']);
        try {
            expect(resolveShotMedia('calls-form', [root])).toEqual({ src: '/platform/shots/calls-form.PNG' });
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('видео — с постером, если он рядом', () => {
        const root = withPublic(['platform/video/hub-overview.mp4', 'platform/video/hub-overview.jpg']);
        try {
            expect(resolveShotMedia('hub-overview', [root])).toEqual({
                src: '/platform/video/hub-overview.mp4',
                poster: '/platform/video/hub-overview.jpg',
            });
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
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
