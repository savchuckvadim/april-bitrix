import { initializeB24Frame } from '@bitrix24/b24jssdk';

/**
 * Завершение установки маркетплейс-приложения из iframe мастера Битрикс24.
 * Официальный @bitrix24/b24jssdk v2: initializeB24Frame → installFinish.
 *
 * Таймаут вокруг init — только чтобы показать ошибку вместо вечного
 * спиннера: у SDK нет таймаута на рукопожатие getInitData с родительским
 * окном (промис висит, если родитель не ответил).
 */

export interface IInstallFinishResult {
    /** false — приложение уже установлено, installFinish не требовался */
    finished: boolean;
}

const INIT_TIMEOUT_MS = 10000;

const withTimeout = <T>(promise: Promise<T>, label: string): Promise<T> =>
    Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            window.setTimeout(
                () =>
                    reject(
                        new Error(
                            `${label}: Битрикс24 не ответил за ${INIT_TIMEOUT_MS / 1000}с — откройте страницу внутри портала`,
                        ),
                    ),
                INIT_TIMEOUT_MS,
            ),
        ),
    ]);

/**
 * Завершает установку приложения. Вызывать ТОЛЬКО при ?install=success:
 * после installFinish Битрикс закрывает мастер и перезагружает приложение.
 */
export const finishInstall = async (): Promise<IInstallFinishResult> => {
    const b24 = await withTimeout(initializeB24Frame(), 'initializeB24Frame');

    // Повторное открытие уже установленного приложения через страницу
    // установки: installFinish запрещён SDK — это успех, а не ошибка.
    if (!b24.isInstallMode) {
        console.log(
            'bx-install: приложение уже установлено (isInstallMode=false)',
        );
        return { finished: false };
    }

    await withTimeout(b24.installFinish(), 'installFinish');
    return { finished: true };
};