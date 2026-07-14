import { finishInstall } from '@workspace/bitrix';

/**
 * Завершение установки маркетплейс-приложения.
 *
 * Логика — в @workspace/bitrix (finishInstall): официальный
 * @bitrix24/b24jssdk v2 с таймаутом на рукопожатие и автофолбэком
 * на классический BX24.js. Вызывать ТОЛЬКО при ?install=success.
 */
export const bxInstallHelper = async (): Promise<boolean> => {
    console.log('bxInstallHelper');
    const result = await finishInstall();
    console.log('bxInstallHelper result', result);
    return true;
};