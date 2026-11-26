import { describe, expect, it } from 'vitest';
import { KONSTRUCTOR_ROUTE_PATH, ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing/routes';
import { START_ACTIONS, startActionRoute } from '../start-actions';

const action = (route: ROUTE_KONSTRUCTOR) => START_ACTIONS.find(item => item.route === route)!;

describe('start-actions', () => {
    it('«Акции» неактивны: подпись «скоро» и перехода нет', () => {
        const promotions = action(ROUTE_KONSTRUCTOR.PROMOTIONS);
        expect(promotions.title).toBe('Акции');
        expect(promotions.soon).toBe(true);
        expect(startActionRoute(promotions)).toBeNull();
    });

    it('«Избранное» и «Создать» ведут на свои экраны', () => {
        expect(startActionRoute(action(ROUTE_KONSTRUCTOR.FAVORITES))).toBe(ROUTE_KONSTRUCTOR.FAVORITES);
        expect(startActionRoute(action(ROUTE_KONSTRUCTOR.PARAMS))).toBe(ROUTE_KONSTRUCTOR.PARAMS);
        expect(START_ACTIONS.filter(item => item.soon).map(item => item.route)).toEqual([
            ROUTE_KONSTRUCTOR.PROMOTIONS,
        ]);
    });

    it('сам экран акций остаётся в таблице адресов', () => {
        expect(KONSTRUCTOR_ROUTE_PATH[ROUTE_KONSTRUCTOR.PROMOTIONS]).toBe('/promotions');
    });
});
