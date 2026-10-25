import { describe, expect, it } from 'vitest';
import { findCurrentFlowRoute, resolveFlowSteps } from '../flow-steps.util';
import { ROUTE_KONSTRUCTOR } from '../routes';

describe('flow steps', () => {
    it('страница документа принадлежит шагу «Документ»', () => {
        expect(findCurrentFlowRoute('/document/offer')).toBe(
            ROUTE_KONSTRUCTOR.DOCUMENT,
        );
        expect(findCurrentFlowRoute('/documents')).toBeNull();
        expect(findCurrentFlowRoute('/start')).toBeNull();
    });

    it('до текущего — пройдены, после — впереди', () => {
        const steps = resolveFlowSteps('/prices', true);
        expect(steps.map(step => step.state)).toEqual([
            'done',
            'done',
            'current',
            'upcoming',
        ]);
        expect(steps.every(step => !step.disabled)).toBe(true);
    });

    it('без главного товара открыт только шаг «Параметры»', () => {
        const steps = resolveFlowSteps('/params', false);
        expect(steps.map(step => Boolean(step.disabled))).toEqual([
            false,
            true,
            true,
            true,
        ]);
    });
});
