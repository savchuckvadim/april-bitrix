import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
    COMPANY_UNAVAILABLE_ERROR,
    NON_AUTH_ERROR,
    NO_COMPANY_ERROR,
    NO_ENTITY_ERROR,
} from '../../lib/initialize/app-init/app-init.util';
import { CompanyUnavailableScreen } from '../CompanyUnavailableScreen';
import { GATE_SCREENS } from '../gate-screens';
import { NoCompanyScreen } from '../NoCompanyScreen';
import { NoEntityScreen } from '../NoEntityScreen';
import { NonAuthScreen } from '../NonAuthScreen';

describe('гейт-экраны инициализации', () => {
    it('каждой ошибке старта соответствует свой экран', () => {
        expect(GATE_SCREENS.get(NON_AUTH_ERROR)).toBe(NonAuthScreen);
        expect(GATE_SCREENS.get(NO_COMPANY_ERROR)).toBe(NoCompanyScreen);
        expect(GATE_SCREENS.get(NO_ENTITY_ERROR)).toBe(NoEntityScreen);
        expect(GATE_SCREENS.get(COMPANY_UNAVAILABLE_ERROR)).toBe(CompanyUnavailableScreen);
    });

    it('обычная ошибка (текст исключения) гейтом не считается', () => {
        expect(GATE_SCREENS.get('Network Error')).toBeUndefined();
        expect(GATE_SCREENS.get('constructor')).toBeUndefined();
    });

    it('экран лида: «Конструктор работает из сделки или компании» без падения', () => {
        const html = renderToStaticMarkup(createElement(NoEntityScreen));

        expect(html).toContain('Конструктор работает из сделки или компании');
        expect(html).toContain('лида');
    });

    it('экран «компания недоступна» объясняет, что проверить', () => {
        const html = renderToStaticMarkup(createElement(CompanyUnavailableScreen));

        expect(html).toContain('Компания недоступна');
    });
});
