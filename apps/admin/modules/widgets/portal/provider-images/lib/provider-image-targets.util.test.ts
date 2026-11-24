/**
 * Реквизиты поставщиков для страницы картинок: id реквизитов, название
 * карточки и подпись, повторы и поставщики без реквизитов.
 */

import { describe, expect, it } from 'vitest';
import { buildProviderImageTargets } from './provider-image-targets.util';

describe('buildProviderImageTargets', () => {
    it('берёт id из вложенных реквизитов, название из поставщика', () => {
        const targets = buildProviderImageTargets([
            { name: 'Гарант-Офис', rqId: '3', rq: { id: 3, type: 'Организация', inn: '7701234567' } },
        ]);

        expect(targets).toEqual([
            { rqId: 3, title: 'Гарант-Офис', subtitle: 'Организация · ИНН 7701234567' },
        ]);
    });

    it('без вложенных реквизитов берёт rqId поставщика, в том числе строкой', () => {
        expect(buildProviderImageTargets([{ name: 'А', rqId: '12' }])[0]?.rqId).toBe(12);
        expect(buildProviderImageTargets([{ name: 'А', rqId: 12 }])[0]?.rqId).toBe(12);
    });

    it('пропускает поставщиков без пригодного id реквизитов', () => {
        const targets = buildProviderImageTargets([
            { name: 'нет id' },
            { name: 'пусто', rqId: '' },
            { name: 'ноль', rqId: 0 },
            { name: 'мусор', rqId: 'abc' },
            { name: 'дробь', rqId: 1.5 },
            { name: 'минус', rq: { id: -4 } },
            { name: 'годный', rqId: 5 },
        ]);

        expect(targets.map((target) => target.title)).toEqual(['годный']);
    });

    it('один набор реквизитов показывает один раз', () => {
        const targets = buildProviderImageTargets([
            { name: 'Первый', rqId: 4 },
            { name: 'Второй', rqId: '4' },
        ]);

        expect(targets).toHaveLength(1);
        expect(targets[0]?.title).toBe('Первый');
    });

    it('название: поставщик, затем набор реквизитов, затем краткое наименование, затем id', () => {
        const titles = buildProviderImageTargets([
            { name: 'Поставщик', rqId: 1, rq: { name: 'Набор', shortname: 'Кратко' } },
            { name: '  ', rqId: 2, rq: { name: 'Набор', shortname: 'Кратко' } },
            { name: null, rqId: 3, rq: { name: null, shortname: 'Кратко' } },
            { rqId: 4, rq: { name: '', shortname: '' } },
        ]).map((target) => target.title);

        expect(titles).toEqual(['Поставщик', 'Набор', 'Кратко', 'Реквизиты №4']);
    });

    it('подпись собирается из того, что заполнено', () => {
        const subtitles = buildProviderImageTargets([
            { name: 'А', rqId: 1, rq: { type: 'ИП' } },
            { name: 'Б', rqId: 2, rq: { inn: '123' } },
            { name: 'В', rqId: 3, rq: { type: '', inn: null } },
            { name: 'Г', rqId: 4 },
        ]).map((target) => target.subtitle);

        expect(subtitles).toEqual(['ИП', 'ИНН 123', '', '']);
    });

    it('порядок поставщиков сохраняется', () => {
        const rqIds = buildProviderImageTargets([
            { name: 'В', rqId: 30 },
            { name: 'А', rqId: 10 },
            { name: 'Б', rqId: 20 },
        ]).map((target) => target.rqId);

        expect(rqIds).toEqual([30, 10, 20]);
    });

    it('пустой список даёт пустой результат', () => {
        expect(buildProviderImageTargets([])).toEqual([]);
    });
});
