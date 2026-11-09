/**
 * Порядок секций страницы сервиса и чередование подложек: пустые секции
 * выпадают, соседние никогда не сливаются, последняя перед формой — без
 * подложки (у формы она своя).
 */

import { describe, expect, it } from 'vitest';
import { NO_SHOT_MEDIA } from '../lib/platform-media';
import { buildServiceBlocks as buildWithMedia } from '../lib/service-blocks';
import { PLATFORM_SERVICES } from '../model/services';
import type { PlatformService } from '../model/types';

const BASE = PLATFORM_SERVICES[0] as PlatformService;

/** Раскладка без загруженных кадров: при разработке их места — рамки. */
const buildServiceBlocks = (service: PlatformService) => buildWithMedia(service, NO_SHOT_MEDIA);

describe('buildServiceBlocks', () => {
    it('без ролей секция ролей выпадает', () => {
        const kinds = buildServiceBlocks({ ...BASE, roles: undefined }).map(block => block.kind);
        expect(kinds).not.toContain('roles');
        expect(kinds.slice(0, 2)).toEqual(['benefits', 'steps']);
    });

    it('без вопросов и связей эти секции выпадают', () => {
        const kinds = buildServiceBlocks({ ...BASE, faq: [], related: [] }).map(block => block.kind);
        expect(kinds).not.toContain('faq');
        expect(kinds).not.toContain('related');
    });

    it('соседние секции разного тона, последняя — без подложки', () => {
        for (const service of PLATFORM_SERVICES) {
            const blocks = buildServiceBlocks(service);
            blocks.forEach((block, index) => {
                if (index > 0) expect(block.tone, service.slug).not.toBe(blocks[index - 1]?.tone);
            });
            expect(blocks.at(-1)?.tone, service.slug).toBe('plain');
        }
    });
});
