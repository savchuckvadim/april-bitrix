import { describe, expect, it } from 'vitest';
import type { RelatedDeal } from '@/modules/entities/RelatedCrm';
import {
    entityWarningFullText,
    entityWarningsMarkerTone,
    entityWarningTone,
    relationNoticeToWarning,
} from './entity-warning-view';

const deal = (extra: Partial<RelatedDeal> = {}): RelatedDeal =>
    ({
        id: 42,
        title: 'ООО «Ромашка» — продление КонсультантПлюс',
        closed: false,
        stage: { bitrixId: 'C1:NEW' },
        ...extra,
    }) as RelatedDeal;

describe('relationNoticeToWarning', () => {
    it('автопереключение на свою: инфо-тон, название сделки в accent с кавычкой-хвостом', () => {
        const warning = relationNoticeToWarning({
            kind: 'ownOpenSwitch',
            deal: deal(),
        });
        expect(warning.tone).toBe('info');
        expect(warning.blocking).toBe(false);
        expect(warning.accent?.text).toBe(
            'ООО «Ромашка» — продление КонсультантПлюс',
        );
        expect(entityWarningFullText(warning)).toBe(
            'Сделка контекста закрыта — работа продолжается в открытой „ООО «Ромашка» — продление КонсультантПлюс“',
        );
    });

    it('чужая открытая: warning-тон и имя ответственного', () => {
        const warning = relationNoticeToWarning({
            kind: 'foreignOpen',
            deal: deal({
                responsible: { id: 77, name: 'Иван Петров' },
            } as Partial<RelatedDeal>),
        });
        expect(warning.tone).toBe('warning');
        expect(entityWarningFullText(warning)).toBe(
            'У клиента есть открытая сделка менеджера Иван Петров',
        );
    });

    it('чужая без имени ответственного — честный текст без accent', () => {
        const warning = relationNoticeToWarning({
            kind: 'foreignOpen',
            deal: deal(),
        });
        expect(warning.accent).toBeUndefined();
        expect(entityWarningFullText(warning)).toBe(
            'У клиента есть открытая сделка другого менеджера',
        );
    });

    /* Перехват клиента (12.11.2026): чужая сделка не повод для тревоги. */
    describe('перехват клиента', () => {
        const foreign = (id: number, name: string) => ({
            kind: 'foreignOpen' as const,
            deal: deal({ responsible: { id, name } } as Partial<RelatedDeal>),
        });
        const rules = (force: boolean, confirm: boolean) => ({
            force,
            confirm,
            botOwnerIds: [643],
        });

        it('сделка бота — инфо «перейдёт к вам», в любом режиме', () => {
            const warning = relationNoticeToWarning(
                foreign(643, 'Бот Манго'),
                rules(false, true),
            );
            expect(warning.tone).toBe('info');
            expect(entityWarningFullText(warning)).toBe(
                'Сделка Бот Манго перейдёт к вам при отправке отчёта',
            );
        });

        it('перехват с подтверждением — «можно забрать себе»', () => {
            const warning = relationNoticeToWarning(
                foreign(39, 'Марина Гончар'),
                rules(true, true),
            );
            expect(warning.tone).toBe('info');
            expect(entityWarningFullText(warning)).toBe(
                'Работа менеджера Марина Гончар — при отправке можно забрать себе',
            );
        });

        it('перехват без подтверждения — «перейдёт к вам»', () => {
            const warning = relationNoticeToWarning(
                foreign(39, 'Марина Гончар'),
                rules(true, false),
            );
            expect(entityWarningFullText(warning)).toBe(
                'Работа менеджера Марина Гончар перейдёт к вам при отправке отчёта',
            );
        });

        it('перехват выключен и не бот — прежнее предупреждение', () => {
            const warning = relationNoticeToWarning(
                foreign(39, 'Марина Гончар'),
                rules(false, true),
            );
            expect(warning.tone).toBe('warning');
        });
    });
});

describe('тона предупреждений', () => {
    it('без явного тона: blocking → destructive, иначе warning', () => {
        expect(
            entityWarningTone({ id: 'a', text: '', blocking: true }),
        ).toBe('destructive');
        expect(
            entityWarningTone({ id: 'a', text: '', blocking: false }),
        ).toBe('warning');
    });

    it('маркер красится в самый тревожный тон набора', () => {
        const info = { id: 'i', text: '', blocking: false, tone: 'info' } as const;
        const warn = { id: 'w', text: '', blocking: false } as const;
        const block = { id: 'b', text: '', blocking: true } as const;
        expect(entityWarningsMarkerTone([info])).toBe('info');
        expect(entityWarningsMarkerTone([info, warn])).toBe('warning');
        expect(entityWarningsMarkerTone([info, warn, block])).toBe(
            'destructive',
        );
    });
});
