import { describe, expect, it } from 'vitest';
import type { HookParam } from '../model';
import {
    buildWebhookUrl,
    initialWebhookValues,
    isRobotQueryParam,
    parseParamOptions,
} from './webhook-url';

const param = (
    name: string,
    extra: Partial<HookParam> = {},
): HookParam => ({
    name,
    where: 'query',
    values: null,
    default: null,
    required: false,
    description: '',
    runOnly: false,
    ...extra,
});

describe('parseParamOptions: допустимые значения → варианты селекта', () => {
    it('простые коды через «/» становятся вариантами', () => {
        expect(parseParamOptions('Y / N')).toEqual(['Y', 'N']);
        expect(parseParamOptions('from_lead / cold / new')).toEqual([
            'from_lead',
            'cold',
            'new',
        ]);
        expect(parseParamOptions('move / move_keep / close / none')).toEqual([
            'move',
            'move_keep',
            'close',
            'none',
        ]);
        expect(parseParamOptions('contact/company')).toEqual([
            'contact',
            'company',
        ]);
    });

    it('описание словами, даты, пусто — свободный ввод', () => {
        expect(parseParamOptions('user_123 (робот) или число (run)')).toBeNull();
        expect(parseParamOptions('id или название отдела')).toBeNull();
        expect(parseParamOptions('DD.MM.YYYY HH:mm:ss')).toBeNull();
        expect(parseParamOptions('')).toBeNull();
        expect(parseParamOptions(null)).toBeNull();
        expect(parseParamOptions(' / ')).toBeNull();
    });
});

describe('buildWebhookUrl: адрес вебхука для робота', () => {
    const base = 'https://api.event-sales.april-app.ru';
    const path = '/api/sales-hooks/lead-to-work/webhook';

    it('порядок параметров как в values, пустые отбрасываются', () => {
        expect(
            buildWebhookUrl(base, path, {
                leadId: '{{ID}}',
                responsible: '',
                isXo: 'Y',
                stageMode: 'new',
                taskMode: '  ',
            }),
        ).toBe(`${base}${path}?leadId={{ID}}&isXo=Y&stageMode=new`);
    });

    it('без значений — чистый адрес; слэши стыкуются', () => {
        expect(buildWebhookUrl(base, path, {})).toBe(`${base}${path}`);
        expect(buildWebhookUrl(`${base}/`, 'api/x', {})).toBe(`${base}/api/x`);
    });

    it('подстановки {{…}} не кодируются, остальное — кодируется', () => {
        expect(
            buildWebhookUrl(base, path, {
                responsible: 'user_{{ASSIGNED_BY_ID}}',
                name: 'Заявка & звонок',
                department: 'Отдел продаж',
            }),
        ).toBe(
            `${base}${path}?responsible=user_{{ASSIGNED_BY_ID}}` +
                `&name=${encodeURIComponent('Заявка & звонок')}` +
                `&department=${encodeURIComponent('Отдел продаж')}`,
        );
    });

    it('query, уже записанный в пути ручки, отбрасывается', () => {
        expect(
            buildWebhookUrl(base, '/api/x/operations/{operationId}?domain=…', {
                a: '1',
            }),
        ).toBe(`${base}/api/x/operations/{operationId}?a=1`);
    });
});

describe('initialWebhookValues и isRobotQueryParam', () => {
    it('в конструктор идут только query-параметры робота', () => {
        expect(isRobotQueryParam(param('leadId'))).toBe(true);
        expect(isRobotQueryParam(param('excludeResponsible', { where: 'body' }))).toBe(
            false,
        );
        expect(isRobotQueryParam(param('x', { runOnly: true }))).toBe(false);
    });

    it('обязательный идентификатор заполняется {{ID}}, остальное пусто', () => {
        expect(
            initialWebhookValues([
                param('leadId', { required: true }),
                param('dealId'),
                param('isXo', { values: 'Y / N' }),
                param('transferredBy', { where: 'body', runOnly: true }),
            ]),
        ).toEqual({ leadId: '{{ID}}', dealId: '', isXo: '' });
    });
});
