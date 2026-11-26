import type { ComponentType } from 'react';
import { DEV_PLACEMENT_HINT } from '../consts/app-global';
import {
    COMPANY_UNAVAILABLE_ERROR,
    NON_AUTH_ERROR,
    NO_COMPANY_ERROR,
    NO_ENTITY_ERROR,
} from '../lib/initialize/app-init/app-init.util';
import { CompanyUnavailableScreen } from './CompanyUnavailableScreen';
import { DevPlacementScreen } from './DevPlacementScreen';
import { NoCompanyScreen } from './NoCompanyScreen';
import { NoEntityScreen } from './NoEntityScreen';
import { NonAuthScreen } from './NonAuthScreen';

/**
 * Гейт-экраны по коду ошибки инициализации: приложение дальше не идёт, а
 * показывает причину. Прочие ошибки — в обычный error-boundary.
 */
export const GATE_SCREENS: ReadonlyMap<string, ComponentType> = new Map<
    string,
    ComponentType
>([
    [NON_AUTH_ERROR, NonAuthScreen],
    [NO_COMPANY_ERROR, NoCompanyScreen],
    [NO_ENTITY_ERROR, NoEntityScreen],
    [COMPANY_UNAVAILABLE_ERROR, CompanyUnavailableScreen],
    [DEV_PLACEMENT_HINT, DevPlacementScreen],
]);
