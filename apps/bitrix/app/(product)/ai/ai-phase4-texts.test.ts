/**
 * Тексты теории Фазы 4 обязаны совпадать с поведением продукта: ритм пула,
 * настоящие условия ступени «советы с эффектом» (границы интервалов, а не
 * точечные доли; советы с завершённым сравнением, а не выданные),
 * подписи причин в баннере и то, что гипотезу руководитель задаёт сам.
 */

import { describe, expect, it } from 'vitest';
import { AI_PAGES } from './constants/pages';

const pageText = (slug: string): string => {
    const page = AI_PAGES.find(candidate => candidate.slug === slug);
    if (!page) throw new Error(`нет главы ${slug}`);
    return JSON.stringify(page.blocks);
};

const allText = (): string => AI_PAGES.map(page => pageText(page.slug)).join(' ');

describe('теория Фазы 4 совпадает с продуктом', () => {
    it('пул считается раз в месяц, а не раз в квартал', () => {
        const text = `${pageText('quality-link')} ${pageText('settings')}`;
        expect(text).toContain('раз в месяц (3-го числа)');
        expect(text).not.toMatch(/раз в квартал|квартальн/);
    });

    it('условия ступени советов — как у проверки: интервалы и завершённые сравнения', () => {
        const text = allText();
        expect(text).not.toContain('меньше трети');
        expect(text).not.toContain('советов выдано');
        expect(text).not.toContain('Советов выдано');
        expect(pageText('quality-link')).toContain(
            'Советов с завершённым сравнением «до и после»',
        );
        expect(pageText('quality-link')).toContain('уверенно меньше 30 %');
    });

    it('подгонка не снимает совет — закрывает ступень и даёт карточку «Внимания»', () => {
        const text = pageText('quality-link');
        expect(text).not.toContain('совет снимается');
        expect(text).toContain('сам совет из таблицы не убирается');
    });

    it('примеры причин в баннере — фактическими подписями витрины', () => {
        const text = allText();
        expect(text).not.toContain('теневых месяцев 4 из 9');
        expect(text).not.toContain('12 из 20');
        expect(text).not.toContain('ступень не включена');
        expect(text).toContain('Прогноз копится в тени: 4 из 9 месяцев');
        expect(text).toContain('Советов с завершённой проверкой пока меньше 20');
    });

    it('гипотезу качества руководитель задаёт сам; вкладок в настройках шесть', () => {
        expect(pageText('settings')).toContain(
            'состав, гипотезу качества и согласие на пул порталов руководитель или владелец задаёт сам',
        );
        const analytics = pageText('analytics');
        expect(analytics).toContain('ещё пять вкладок');
        expect(analytics).toContain('«Гипотеза качества»');
        expect(analytics).toContain('со всеми шестью вкладками');
    });
});
