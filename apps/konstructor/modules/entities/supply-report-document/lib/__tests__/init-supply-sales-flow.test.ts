import { describe, expect, it } from 'vitest';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { withDepartment } from '../../../offer-document/lib/__fixtures__/presentation-state';
import { oneGarantGeneral } from '../../../offer-document/lib/__fixtures__/variants-state';
import { buildInitSupplyRequest } from '../build-supply-report-request';

/** Запуск поставки (init-supply): признак потока продаж по отделу. */
describe('init-supply: salesFlow', () => {
    const requestOf = (department: APP_DEP) =>
        buildInitSupplyRequest(withDepartment(rootStateWith(oneGarantGeneral()), department), 'https://file', []);

    it('отдел продаж: salesFlow: true', () => {
        expect(requestOf(APP_DEP.SALES)?.salesFlow).toBe(true);
    });

    it('сервисный отдел: поля salesFlow нет, поток перезаключения остаётся', () => {
        const request = requestOf(APP_DEP.SERVICE);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('salesFlow');
        expect(request?.flow).toBe('renewal');
    });

    it('у продаж поток поставки', () => {
        expect(requestOf(APP_DEP.SALES)?.flow).toBe('supply');
    });
});
