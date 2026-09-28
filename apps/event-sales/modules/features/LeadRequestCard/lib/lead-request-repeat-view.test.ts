import { describe, expect, it } from 'vitest';
import { buildLeadRequestRepeatView } from './lead-request-repeat-view';

const repeat = (over: Record<string, unknown> = {}) => ({
    isRepeat: true,
    mainDealId: 42423,
    mainDealTitle: 'МИНИМУЩЕСТВА ВО',
    stageBeforeName: 'Решение',
    willReturnStage: true,
    responsible: { id: 387, name: 'Юлия', active: true, inRotation: true },
    ...over,
});

describe('buildLeadRequestRepeatView', () => {
    it('стадия и ответственный; вернётся после принятия', () => {
        const view = buildLeadRequestRepeatView(repeat() as never, 11);
        expect(view.stageLine).toBe(
            'Работа шла на стадии «Решение» — после принятия сделка вернётся на неё',
        );
        expect(view.responsibleLine).toBe('Вёл клиента: Юлия');
        expect(view.rotationWarning).toBeNull();
    });

    it('висела на мне — «вы»', () => {
        const view = buildLeadRequestRepeatView(repeat() as never, 387);
        expect(view.responsibleLine).toBe('Вёл клиента: вы');
    });

    it('сотрудник уволен или вне круга — предупреждение', () => {
        expect(
            buildLeadRequestRepeatView(
                repeat({
                    responsible: {
                        id: 461,
                        name: null,
                        active: false,
                        inRotation: false,
                    },
                }) as never,
                1,
            ),
        ).toMatchObject({
            responsibleLine: 'Вёл клиента: #461',
            rotationWarning: 'сотрудник не работает',
        });
        expect(
            buildLeadRequestRepeatView(
                repeat({
                    responsible: {
                        id: 5,
                        name: 'Анна',
                        active: true,
                        inRotation: false,
                    },
                }) as never,
                1,
            ).rotationWarning,
        ).toBe('сотрудника нет в карусели распределения');
    });

    it('стадии возврата нет — без хвоста про возврат', () => {
        const view = buildLeadRequestRepeatView(
            repeat({ willReturnStage: false }) as never,
            1,
        );
        expect(view.stageLine).toBe('Работа шла на стадии «Решение»');
    });
});
