import { describe, expect, it } from 'vitest';
import { APP_DEP } from '../../model/AppSlice';
import { salesFlowFields } from '../sales-flow.util';

describe('salesFlowFields', () => {
    it('отдел продаж: salesFlow: true', () => {
        expect(salesFlowFields(APP_DEP.SALES)).toEqual({ salesFlow: true });
    });

    it('сервисный отдел: пустой набор, ключа salesFlow нет', () => {
        const fields = salesFlowFields(APP_DEP.SERVICE);
        expect(fields).toEqual({});
        expect(fields).not.toHaveProperty('salesFlow');
    });
});
