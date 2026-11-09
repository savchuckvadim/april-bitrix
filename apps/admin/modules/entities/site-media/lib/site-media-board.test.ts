/**
 * Раскладка мест кадров по страницам сайта: каждое место ровно на своей
 * странице, первая очередь сверху, счётчики честные, файлы мест, которых
 * нет на сайте, не теряются.
 */

import { describe, expect, it } from 'vitest';
import { PLATFORM_SHOTS, type SiteMediaItem } from '@workspace/site-media';
import { buildSiteMediaBoard } from './site-media-board';

const item = (slot: string, kind: SiteMediaItem['kind'] = 'image'): SiteMediaItem => ({
    slot,
    kind,
    file: `${slot}.0123456789ab.${kind === 'video' ? 'mp4' : 'png'}`,
    size: 2048,
    updatedAt: '2026-11-09T12:00:00.000Z',
});

describe('buildSiteMediaBoard', () => {
    it('каждое место реестра — ровно на одной странице', () => {
        const board = buildSiteMediaBoard([]);
        const ids = board.pages.flatMap(page => page.slots.map(slot => slot.id));
        expect(ids.sort()).toEqual(Object.keys(PLATFORM_SHOTS).sort());
        expect(board.total).toBe(ids.length);
        expect(board.uploaded).toBe(0);
    });

    it('главная раздела — первой, места внутри страницы — от первой очереди', () => {
        const board = buildSiteMediaBoard([]);
        expect(board.pages[0]?.path).toBe('/platform');
        for (const page of board.pages) {
            const priorities = page.slots.map(slot => slot.spec.priority);
            expect(priorities, page.path).toEqual([...priorities].sort());
        }
    });

    it('загруженное встаёт на своё место и попадает в счётчики', () => {
        const board = buildSiteMediaBoard([item('calls-form'), item('hub-overview', 'video')]);
        const calls = board.pages.find(page => page.path === '/platform/calls');
        expect(calls?.slots.find(slot => slot.id === 'calls-form')?.item?.slot).toBe('calls-form');
        expect(calls?.uploaded).toBe(1);
        expect(board.uploaded).toBe(2);
    });

    it('первая очередь без файла считается, загруженная — нет', () => {
        const before = buildSiteMediaBoard([]).firstPriorityMissing;
        expect(before).toBeGreaterThan(0);
        expect(buildSiteMediaBoard([item('calls-form')]).firstPriorityMissing).toBe(before - 1);
    });

    it('файл места, которого нет на страницах, — в «не используются», а не теряется', () => {
        const board = buildSiteMediaBoard([item('old-removed-shot'), item('constructor')]);
        expect(board.orphans.map(orphan => orphan.slot)).toEqual(['old-removed-shot', 'constructor']);
        expect(board.uploaded).toBe(0);
    });
});
