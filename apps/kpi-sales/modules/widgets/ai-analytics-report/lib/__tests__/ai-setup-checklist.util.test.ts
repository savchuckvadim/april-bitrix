import { describe, expect, it } from 'vitest';
import { AI_CHECKLIST_TEXT } from '../ai-setup-checklist.texts';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_SECTION,
    AI_CHECKLIST_STATUS,
    AI_CHECKLIST_VERDICT,
    type AiChecklistItem,
} from '../ai-setup-checklist.types';
import {
    aiChecklistHeadline,
    aiChecklistProgressShare,
    aiChecklistUnknownLines,
    aiChecklistVerdict,
    aiNearestEtaItem,
    buildAiChecklistSections,
    formatAiChecklistEta,
    formatAiChecklistProgress,
} from '../ai-setup-checklist.util';

/* Чистые функции итога, фразы и разделов; сценарии портала — .scenarios.test.ts. */

const item = (overrides: Partial<AiChecklistItem> = {}): AiChecklistItem => ({
    key: 'k',
    code: AI_CHECKLIST_ITEM.ROSTER,
    group: AI_CHECKLIST_GROUP.CONFIGURE,
    status: AI_CHECKLIST_STATUS.TODO,
    optional: false,
    title: 'Пункт',
    detail: 'Деталь.',
    unlocks: null,
    progress: null,
    eta: null,
    actions: [],
    ...overrides,
});

describe('aiChecklistVerdict — приоритет data > configure > wait > ready', () => {
    const data = item({ group: AI_CHECKLIST_GROUP.DATA });
    const configure = item({ group: AI_CHECKLIST_GROUP.CONFIGURE });
    const wait = item({ group: AI_CHECKLIST_GROUP.WAIT });

    it('данные важнее настройки и ожидания', () => {
        expect(aiChecklistVerdict([wait, configure, data])).toBe(
            AI_CHECKLIST_VERDICT.DATA,
        );
        expect(aiChecklistVerdict([wait, configure])).toBe(
            AI_CHECKLIST_VERDICT.CONFIGURE,
        );
        expect(aiChecklistVerdict([wait])).toBe(AI_CHECKLIST_VERDICT.WAIT);
        expect(aiChecklistVerdict([])).toBe(AI_CHECKLIST_VERDICT.READY);
    });

    it('рекомендации, готовые и непроверенные пункты на итог не влияют', () => {
        expect(
            aiChecklistVerdict([
                item({ group: AI_CHECKLIST_GROUP.DATA, optional: true }),
                item({ optional: true }),
                item({ status: AI_CHECKLIST_STATUS.DONE }),
                item({
                    group: AI_CHECKLIST_GROUP.DATA,
                    status: AI_CHECKLIST_STATUS.UNKNOWN,
                }),
            ]),
        ).toBe(AI_CHECKLIST_VERDICT.READY);
    });
});

describe('aiChecklistHeadline — одна фраза «что делать сейчас»', () => {
    it('data/configure: первый блокер и «и ещё N»', () => {
        const items = [
            item({ group: AI_CHECKLIST_GROUP.DATA, title: 'Разбор выключен' }),
            item({ group: AI_CHECKLIST_GROUP.DATA, title: 'Второе' }),
        ];
        expect(aiChecklistHeadline(AI_CHECKLIST_VERDICT.DATA, items)).toBe(
            'Сначала данные: Разбор выключен и ещё 1 — пока это не решено, ждать бесполезно.',
        );
        expect(
            aiChecklistHeadline(AI_CHECKLIST_VERDICT.CONFIGURE, [
                item({ title: 'Цель месяца не задана' }),
            ]),
        ).toBe(
            'Нужно донастроить: Цель месяца не задана — остальное наберётся само.',
        );
    });

    it('wait: ближайший срок; без сроков — «копятся сами»', () => {
        const wait = (date: string, title: string) =>
            item({
                group: AI_CHECKLIST_GROUP.WAIT,
                title,
                eta: { date, rough: false, time: '04:00' },
            });
        const headline = aiChecklistHeadline(AI_CHECKLIST_VERDICT.WAIT, [
            wait('2026-11-01', 'Позже'),
            wait('2026-10-03', 'Модель портала'),
        ]);
        expect(headline).toContain('Сейчас настраивать нечего');
        expect(headline).toContain(
            'ближайшее: Модель портала (03.10.2026, 04:00)',
        );
        expect(
            aiChecklistHeadline(AI_CHECKLIST_VERDICT.WAIT, [
                item({ group: AI_CHECKLIST_GROUP.WAIT }),
            ]),
        ).toBe(AI_CHECKLIST_TEXT.headline.waitNoEta);
    });

    it('ready: с открытыми рекомендациями — «главное готово»', () => {
        expect(aiChecklistHeadline(AI_CHECKLIST_VERDICT.READY, [])).toBe(
            AI_CHECKLIST_TEXT.headline.ready,
        );
        expect(
            aiChecklistHeadline(AI_CHECKLIST_VERDICT.READY, [
                item({ optional: true }),
            ]),
        ).toBe(AI_CHECKLIST_TEXT.headline.readyOptional);
    });

    it('ready с непроверенными пунктами — не «в полную силу»', () => {
        expect(
            aiChecklistHeadline(AI_CHECKLIST_VERDICT.READY, [
                item({ status: AI_CHECKLIST_STATUS.UNKNOWN }),
            ]),
        ).toBe(AI_CHECKLIST_TEXT.headline.readyUnknown);
    });
});

describe('buildAiChecklistSections — разделы', () => {
    it('порядок data → configure → wait → unknown → done, пустых нет, блокеры выше рекомендаций', () => {
        const sections = buildAiChecklistSections([
            item({ key: 'done', status: AI_CHECKLIST_STATUS.DONE }),
            item({ key: 'opt', optional: true }),
            item({ key: 'req' }),
            item({ key: 'unk', status: AI_CHECKLIST_STATUS.UNKNOWN }),
            item({ key: 'data', group: AI_CHECKLIST_GROUP.DATA }),
        ]);
        expect(sections.map(section => section.key)).toEqual([
            AI_CHECKLIST_SECTION.DATA,
            AI_CHECKLIST_SECTION.CONFIGURE,
            AI_CHECKLIST_SECTION.UNKNOWN,
            AI_CHECKLIST_SECTION.DONE,
        ]);
        expect(sections[1]?.items.map(entry => entry.key)).toEqual([
            'req',
            'opt',
        ]);
        expect(sections[0]?.title).toBe('Сначала данные');
    });
});

describe('вид пункта: срок, прогресс, «не проверить»', () => {
    it('formatAiChecklistEta: расписание — с временем, по темпу — «≈»', () => {
        expect(
            formatAiChecklistEta({
                date: '2026-10-03',
                rough: false,
                time: '04:00',
            }),
        ).toBe('03.10.2026, 04:00');
        expect(
            formatAiChecklistEta({
                date: '2026-11-12',
                rough: true,
                time: null,
            }),
        ).toBe('≈ 12.11.2026');
    });

    it('aiNearestEtaItem — самый ранний срок, без сроков — null', () => {
        expect(aiNearestEtaItem([item()])).toBeNull();
        expect(
            aiNearestEtaItem([
                item({
                    key: 'b',
                    eta: { date: '2026-12-01', rough: true, time: null },
                }),
                item({
                    key: 'a',
                    eta: { date: '2026-10-01', rough: true, time: null },
                }),
            ])?.key,
        ).toBe('a');
    });

    it('прогресс «3 из 8» и доля в [0; 1]', () => {
        expect(formatAiChecklistProgress({ value: 3, target: 8 })).toBe(
            '3 из 8',
        );
        expect(aiChecklistProgressShare({ value: 3, target: 8 })).toBe(0.375);
        expect(aiChecklistProgressShare({ value: 12, target: 8 })).toBe(1);
        expect(aiChecklistProgressShare({ value: 1, target: 0 })).toBe(0);
    });

    it('«не проверить» — одна строка на причину', () => {
        expect(
            aiChecklistUnknownLines([
                item({ title: 'Тренды', detail: 'Проверим позже.' }),
                item({ title: 'Стаж', detail: 'Проверим позже.' }),
                item({ title: 'Разбор', detail: 'Статус не прочитан.' }),
            ]),
        ).toEqual([
            'Тренды · Стаж — проверим позже.',
            'Разбор — статус не прочитан.',
        ]);
    });
});
