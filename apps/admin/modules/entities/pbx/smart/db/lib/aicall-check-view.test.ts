import { describe, expect, it } from 'vitest';
import type { AicallCheckResult } from '../model';
import { toAicallCheckView } from './aicall-check-view';

const result = (fields: Partial<AicallCheckResult> = {}): AicallCheckResult => ({
    domain: 'gsr.bitrix24.ru',
    installed: true,
    entityTypeId: 1056,
    expected: 82,
    present: 82,
    total: 82,
    methodologyExpected: 6,
    methodologyPresent: 6,
    missing: [],
    enumGaps: [],
    extra: [],
    ...fields,
});

describe('toAicallCheckView', () => {
    it('все поля на месте: установка не нужна', () => {
        const view = toAicallCheckView(result());

        expect(view.status).toBe('ok');
        expect(view.summary).toEqual([
            'Полей по конфигу: 82, на портале есть: 82',
            'Поля сводки методики: 6 из 6',
            'Всего полей у смарта на портале: 82',
        ]);
        expect(view.advice).toBe('Все поля на месте, установка не нужна.');
    });

    it('смарта нет: счётчиков нет, совет — установить', () => {
        const view = toAicallCheckView(
            result({ installed: false, entityTypeId: null, present: 0 }),
        );

        expect(view.status).toBe('not-installed');
        expect(view.summary).toEqual([]);
        expect(view.advice).toContain('запустите установку');
    });

    it('портал с лимитом: поля методики отдельно от остальных, лишние поля — места для освобождения', () => {
        const view = toAicallCheckView(
            result({
                present: 79,
                total: 81,
                methodologyPresent: 4,
                missing: [
                    {
                        fieldName: 'UF_CRM_7_SPIRALS_FULL',
                        code: 'SPIRALS_FULL',
                        title: 'Полных спиралей презентации',
                        section: 'Итоги разбора',
                        methodology: true,
                    },
                    {
                        fieldName: 'UF_CRM_7_CAPS_APPLIED',
                        code: 'CAPS_APPLIED',
                        title: 'Оценка ограничена',
                        section: null,
                        methodology: true,
                    },
                    {
                        fieldName: 'UF_CRM_7_SCORE',
                        code: 'SCORE',
                        title: 'Оценка звонка (1-10)',
                        section: 'Итоги разбора',
                        methodology: false,
                    },
                ],
                extra: [
                    {
                        fieldName: 'UF_CRM_7_RESUME_GIGACHAT',
                        title: 'Резюме (GigaChat)',
                    },
                    { fieldName: 'UF_CRM_7_OLD', title: '' },
                ],
            }),
        );

        expect(view.status).toBe('gaps');
        expect(view.summary[1]).toBe('Поля сводки методики: 4 из 6');
        expect(view.summary[2]).toBe(
            'Всего полей у смарта на портале: 81, из них лишних: 2',
        );
        expect(view.missingMethodology).toEqual([
            'Полных спиралей презентации (раздел «Итоги разбора»)',
            'Оценка ограничена',
        ]);
        expect(view.missingOther).toEqual([
            'Оценка звонка (1-10) (раздел «Итоги разбора»)',
        ]);
        expect(view.extra).toEqual([
            'Резюме (GigaChat) — UF_CRM_7_RESUME_GIGACHAT',
            'UF_CRM_7_OLD',
        ]);
        expect(view.advice).toContain('каждое освобождает одно место');
    });

    it('неполный список: значения названы словами, совет без лимита', () => {
        const view = toAicallCheckView(
            result({
                enumGaps: [
                    {
                        fieldName: 'UF_CRM_7_RISK_FLAGS',
                        title: 'Риск-флаги',
                        missing: ['Клиент закрыл дверь', 'Обещание без срока'],
                    },
                ],
            }),
        );

        expect(view.status).toBe('gaps');
        expect(view.enumGaps).toEqual([
            'Риск-флаги: нет значений «Клиент закрыл дверь», «Обещание без срока»',
        ]);
        expect(view.advice).not.toContain('лимит');
    });
});
