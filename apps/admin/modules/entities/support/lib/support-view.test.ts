import { describe, expect, it } from 'vitest';
import {
    formatWait,
    isExternalHref,
    summarizeChecklist,
} from './support-view';
import type { SupportGuideCheck } from '../model';

const check = (status: SupportGuideCheck['status']): SupportGuideCheck => ({
    key: status,
    title: status,
    status,
    hint: '',
    link: null,
});

describe('support-view', () => {
    it('внешняя ссылка — портал Битрикса, путь админки — внутренняя', () => {
        expect(isExternalHref('https://april-dev.bitrix24.ru/note/document/5/')).toBe(true);
        expect(isExternalHref('/portal/7/app-settings')).toBe(false);
    });

    it('итог чек-листа по статусам', () => {
        expect(
            summarizeChecklist([check('done'), check('todo'), check('todo'), check('manual')]),
        ).toEqual({ done: 1, todo: 2, manual: 1 });
    });

    it('ожидание клиента словами', () => {
        expect(formatWait(0)).toBe('ответили');
        expect(formatWait(12)).toBe('12 мин');
        expect(formatWait(65)).toBe('1 ч 5 мин');
        expect(formatWait(120)).toBe('2 ч');
    });
});
