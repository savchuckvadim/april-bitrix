import { describe, expect, it } from 'vitest';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE } from '../../../complect-variant/model/dto';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { withDepartment } from '../../../offer-document/lib/__fixtures__/presentation-state';
import { buildContractGenerateRequest, buildUnitContractGenerateRequest } from '../build-contract-request';
import { selectContractUnits } from '../select-contract-units';
import { contractUnitsState, twoVariantRecords } from '../__fixtures__/contract-units-state';
import { oneGarantGeneral } from '../../../offer-document/lib/__fixtures__/variants-state';

/** Договор: признак потока продаж по отделу, у единичного договора и у договорной единицы. */
describe('договор: salesFlow', () => {
    const single = (department: APP_DEP): RootState => withDepartment(rootStateWith(oneGarantGeneral()), department);

    it('отдел продаж: contract/generate несёт salesFlow: true', () => {
        expect(buildContractGenerateRequest(single(APP_DEP.SALES))?.salesFlow).toBe(true);
    });

    it('сервисный отдел: поля salesFlow нет совсем', () => {
        const request = buildContractGenerateRequest(single(APP_DEP.SERVICE));
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('salesFlow');
    });

    it('нечего печатать — запроса нет, поле salesFlow не создаёт запрос из ничего', () => {
        const empty = withDepartment(rootStateWith({ ...oneGarantGeneral(), rows: [] }), APP_DEP.SALES);
        expect(buildContractGenerateRequest(empty)).toBeNull();
    });

    describe('договорная единица', () => {
        const unitRequest = (department: APP_DEP) => {
            const state = withDepartment(contractUnitsState(COMPLECT_MODE.multi_contract, twoVariantRecords()), department);
            const unit = selectContractUnits(state).units[0]!;
            return buildUnitContractGenerateRequest(state, unit, { specification: [], contractNumber: '' });
        };

        it('отдел продаж: salesFlow: true', () => {
            expect(unitRequest(APP_DEP.SALES)?.salesFlow).toBe(true);
        });

        it('сервисный отдел: поля salesFlow нет', () => {
            const request = unitRequest(APP_DEP.SERVICE);
            expect(request).not.toBeNull();
            expect(request).not.toHaveProperty('salesFlow');
        });
    });
});
