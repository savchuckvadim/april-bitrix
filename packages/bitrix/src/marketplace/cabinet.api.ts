import { pbxRequest } from './pbx-api.client';
import type { CabinetSummary } from './session.types';

/**
 * API кабинета (под portal-context Bearer — клиент подставляет сам).
 * Контракт: back /api/bitrix-marketplace/cabinet.
 */

/** Сводка кабинета: продукты портала + статусы компонентов установки */
export function getCabinetSummary(): Promise<CabinetSummary> {
    return pbxRequest<CabinetSummary>({
        method: 'GET',
        path: '/api/bitrix-marketplace/cabinet/summary',
    });
}
