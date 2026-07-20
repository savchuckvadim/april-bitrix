import { pbxRequest } from './pbx-api.client';
import { portalSessionStore } from './session.store';
import type { InstallProductResult, RedeemInviteResult } from './session.types';

/**
 * API кода подключения портала к внешнему сервису April.
 * Контракт бэка: back/apps/pbx/src/marketplace (onboarding + cabinet).
 *
 * Оба вызова идут под portal-context Bearer (клиент подставляет сам),
 * member_id бэк берёт из проверенного токена — фронт его не передаёт.
 */

/**
 * Погасить код подключения из письма.
 *
 * Код нормализует бэк (регистр и дефисы не важны), поэтому здесь только
 * подрезаем пробелы по краям. Успех переводит стор в новое состояние
 * допуска — кабинет перерисуется сам (usePortalSession).
 */
export async function redeemInviteCode(
    code: string,
): Promise<RedeemInviteResult> {
    const result = await pbxRequest<RedeemInviteResult>({
        method: 'POST',
        path: '/api/bitrix-marketplace/onboarding/redeem',
        body: { code: code.trim() },
    });
    portalSessionStore.patchState(result.state);
    return result;
}

/**
 * Запустить установку продукта на портале — кнопка клиента.
 *
 * Нужна, когда код выпущен без автоматической установки
 * (auto_provision=false); она же — будущая точка входа мастера настройки.
 */
export function installProduct(): Promise<InstallProductResult> {
    return pbxRequest<InstallProductResult>({
        method: 'POST',
        path: '/api/bitrix-marketplace/cabinet/install-product',
    });
}
