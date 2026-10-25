import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { buildGarantRow } from '../../../row-set';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import {
    selectIsServiceSmartMode,
    selectServiceSmartId,
    selectServiceTarget,
    serviceOfferActions,
    serviceOfferReducer,
} from '../../model/ServiceOfferSlice';
import { buildServiceOfferTitle } from '../service-offer-title.util';

const catalog = catalogFromOldInit(oldInit);

describe('buildServiceOfferTitle', () => {
    it('комплект · поставка · вид договора; без строки — пусто', () => {
        const row = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'm',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'internet_5',
            contractCode: 'abonYear',
        })!;
        const title = buildServiceOfferTitle(catalog, row);
        expect(title).toContain(catalog.complects.byCode['buh']!.fullTitle);
        expect(title).toContain(catalog.supplies.byCode['internet_5']!.name);
        expect(title.endsWith('Абонемент')).toBe(true);
        expect(buildServiceOfferTitle(catalog, null)).toBe('');
    });
});

describe('service-offer selectors', () => {
    const app = (department: APP_DEP) => ({ department }) as never;
    const initial = serviceOfferReducer(undefined, { type: '@@init' });
    const withState = (mode: 'deal' | 'smart', smartId: number | null, department = APP_DEP.SERVICE) => ({
        app: app(department),
        serviceOffer: [
            serviceOfferActions.loaded({ smartId, hasDealSnapshot: true, hasSmartSnapshot: Boolean(smartId) }),
            serviceOfferActions.setMode(mode),
        ].reduce(serviceOfferReducer, initial),
    });

    it('смарт-режим только у сервисного отдела и только в «следующем периоде»', () => {
        expect(selectIsServiceSmartMode(withState('smart', 77))).toBe(true);
        expect(selectIsServiceSmartMode(withState('deal', 77))).toBe(false);
        expect(selectIsServiceSmartMode(withState('smart', 77, APP_DEP.SALES))).toBe(false);
        expect(selectServiceSmartId(withState('smart', 77))).toBe(77);
        expect(selectServiceSmartId(withState('deal', 77))).toBeNull();
        expect(selectServiceTarget(withState('smart', null))).toEqual({ kind: 'smart', smartType: 'service_offer', smartId: null });
        expect(selectServiceTarget(withState('deal', 5))).toBeNull();
    });
});
