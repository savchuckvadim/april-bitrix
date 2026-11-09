/**
 * Кадры раздела с сервера: список бэка → кадры страниц, и что делает
 * страница, когда бэк недоступен. Ошибка здесь — либо кадр с адресом,
 * который не откроется, либо пропавшие с живой страницы кадры из-за
 * минутного сбоя бэка.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SiteMediaItem } from '@workspace/site-media';
import {
    PLATFORM_MEDIA_PATH,
    PLATFORM_MEDIA_REVALIDATE_SECONDS,
    fetchPlatformMedia,
    toShotMediaMap,
} from '../lib/platform-media';
import { isShotReady, visibleShots } from '../lib/shot-visibility';

const IMAGE: SiteMediaItem = {
    slot: 'calls-form',
    kind: 'image',
    file: 'calls-form.0123456789ab.webp',
    size: 1000,
    updatedAt: '2026-11-09T12:00:00.000Z',
};

const VIDEO: SiteMediaItem = {
    slot: 'hub-overview',
    kind: 'video',
    file: 'hub-overview.aaaaaaaaaaaa.mp4',
    size: 9000,
    updatedAt: '2026-11-09T12:00:00.000Z',
    poster: 'hub-overview.poster.bbbbbbbbbbbb.jpg',
};

const ITEMS = [IMAGE, VIDEO];

/** `export const revalidate` страницы: Next требует литерал, сверяем его с шагом списка. */
const pageRevalidate = (page: string): number | undefined => {
    const source = readFileSync(resolve(__dirname, '..', page), 'utf8');
    const match = /export const revalidate = (\d+);/.exec(source);
    return match ? Number(match[1]) : undefined;
};

const envelope = (data: unknown, resultCode = 0) => Response.json({ resultCode, data });

describe('toShotMediaMap', () => {
    it('кадр — адрес на сайте /media/platform/<файл>, у видео — постер', () => {
        const media = toShotMediaMap(ITEMS);
        expect(media.get('calls-form')).toEqual({
            kind: 'image',
            src: '/media/platform/calls-form.0123456789ab.webp',
        });
        expect(media.get('hub-overview')).toEqual({
            kind: 'video',
            src: '/media/platform/hub-overview.aaaaaaaaaaaa.mp4',
            poster: '/media/platform/hub-overview.poster.bbbbbbbbbbbb.jpg',
        });
    });

    it('место, которого нет в реестре, и прототип объекта — не кадры', () => {
        const media = toShotMediaMap([
            { ...IMAGE, slot: 'old-removed-shot' },
            { ...IMAGE, slot: 'constructor' },
        ]);
        expect(media.size).toBe(0);
    });

    it('видимость считается по списку: есть файл — кадр готов', () => {
        const media = toShotMediaMap(ITEMS);
        expect(isShotReady('calls-form', media)).toBe(true);
        expect(isShotReady('kpi-all-tab', media)).toBe(false);
        expect(visibleShots(['calls-form'], media)).toEqual(['calls-form']);
    });
});

describe('fetchPlatformMedia', () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('берёт список раздела у бэка и сверяет его раз в минуту', async () => {
        fetchMock.mockResolvedValueOnce(envelope({ items: ITEMS }));
        const media = await fetchPlatformMedia();
        expect(media.size).toBe(2);
        const [url, init] = fetchMock.mock.calls[0] ?? [];
        expect(url).toBe(`https://api.bot.april-app.ru/${PLATFORM_MEDIA_PATH}`);
        expect(init?.next?.revalidate).toBe(PLATFORM_MEDIA_REVALIDATE_SECONDS);
    });

    it('страницы сверяются с тем же шагом, что и список', () => {
        expect(pageRevalidate('page.tsx')).toBe(PLATFORM_MEDIA_REVALIDATE_SECONDS);
        expect(pageRevalidate('[service]/page.tsx')).toBe(PLATFORM_MEDIA_REVALIDATE_SECONDS);
    });

    it('битые записи отбрасываются, а не ломают страницу', async () => {
        fetchMock.mockResolvedValueOnce(
            envelope({ items: [...ITEMS, { slot: 'kpi-all-tab', kind: 'image', file: '../../etc/passwd' }] }),
        );
        expect([...(await fetchPlatformMedia()).keys()]).toEqual(['calls-form', 'hub-overview']);
    });

    it('при разработке и при сборке образа бэк недоступен — страница без кадров', async () => {
        fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
        await expect(fetchPlatformMedia()).resolves.toEqual(new Map());

        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PHASE', 'phase-production-build');
        await expect(fetchPlatformMedia()).resolves.toEqual(new Map());
    });

    it('на живом сайте сбой бэка пробрасывается — Next оставит прежнюю страницу с кадрами', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXT_PHASE', '');
        fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
        await expect(fetchPlatformMedia()).rejects.toThrow('ECONNREFUSED');
        fetchMock.mockResolvedValueOnce(new Response('oops', { status: 502 }));
        await expect(fetchPlatformMedia()).rejects.toThrow('502');
        fetchMock.mockResolvedValueOnce(envelope(null, 1));
        await expect(fetchPlatformMedia()).rejects.toThrow('resultCode');
    });
});
