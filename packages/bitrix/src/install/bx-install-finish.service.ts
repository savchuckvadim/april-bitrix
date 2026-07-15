import { initializeB24Frame } from '@bitrix24/b24jssdk';

/**
 * Завершение установки маркетплейс-приложения из iframe мастера Битрикс24.
 * Официальный @bitrix24/b24jssdk v2: initializeB24Frame → installFinish.
 *
 * Таймаут вокруг init — только чтобы показать ошибку вместо вечного
 * спиннера: у SDK нет таймаута на рукопожатие getInitData с родительским
 * окном (промис висит, если родитель не ответил).
 *
 * ДИАГНОСТИКА (обильные логи по задаче отладки установки 2026-07-14):
 * SDK читает контекст из window.name (`domain|protocol|appSid`) и шлёт
 * postMessage родителю; молчание родителя = таймаут. Чтобы отличать
 * причины, логируем снимок контекста и ВСЕ входящие message-события
 * за время рукопожатия:
 *  - window.name пуст → iframe открыт не Битриксом (SDK упал бы мгновенно);
 *  - messagesFromParent=0 при живом window.name → родитель НЕ ответил
 *    (гипотеза: отвечает только origin'у зарегистрированного URL приложения);
 *  - сообщения приходят, но init висит → фильтр на нашей стороне/протокол.
 */

export interface IInstallFinishResult {
    /** false — приложение уже установлено, installFinish не требовался */
    finished: boolean;
}

const INIT_TIMEOUT_MS = 10000;
const LOG_PREFIX = 'bx-install:diag';

interface IFrameDiagnostics {
    href: string;
    referrer: string;
    isFramed: boolean;
    hasWindowName: boolean;
    windowNameMasked: string;
}

const mask = (value: string): string =>
    value.length <= 8 ? '***' : `${value.slice(0, 4)}***${value.slice(-4)}`;

/** Снимок контекста iframe (appSid в window.name маскируется) */
const collectFrameDiagnostics = (): IFrameDiagnostics => {
    const name = window.name || '';
    const [domain = '', protocol = '', appSid = ''] = name.split('|');
    return {
        href: window.location.href,
        referrer: document.referrer,
        isFramed: window.self !== window.top,
        hasWindowName: name.length > 0,
        windowNameMasked: name
            ? `${domain}|${protocol}|${mask(appSid)}`
            : '(пусто)',
    };
};

/** Шпион входящих postMessage на время рукопожатия */
const createMessageSpy = () => {
    const received: Array<{ origin: string; preview: string }> = [];
    const listener = (event: MessageEvent) => {
        const raw =
            typeof event.data === 'string'
                ? event.data
                : JSON.stringify(event.data);
        const entry = {
            origin: event.origin,
            preview: (raw ?? '').slice(0, 80),
        };
        received.push(entry);
        console.log(`${LOG_PREFIX} ← message от родителя`, entry);
    };
    window.addEventListener('message', listener);
    return {
        received,
        stop: () => window.removeEventListener('message', listener),
    };
};

const withTimeout = <T>(
    promise: Promise<T>,
    label: string,
    diagnosticsTail: () => string,
): Promise<T> =>
    Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            window.setTimeout(
                () =>
                    reject(
                        new Error(
                            `${label}: Битрикс24 не ответил за ${INIT_TIMEOUT_MS / 1000}с — откройте страницу внутри портала. ${diagnosticsTail()}`,
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
    const diagnostics = collectFrameDiagnostics();
    console.log(`${LOG_PREFIX} контекст перед init`, diagnostics);

    const spy = createMessageSpy();
    const diagnosticsTail = () =>
        `[диагностика: iframe=${diagnostics.isFramed ? 'да' : 'НЕТ'}, ` +
        `window.name=${diagnostics.hasWindowName ? diagnostics.windowNameMasked : 'ПУСТО'}, ` +
        `сообщений от родителя за время ожидания: ${spy.received.length}]`;

    try {
        const b24 = await withTimeout(
            initializeB24Frame(),
            'initializeB24Frame',
            diagnosticsTail,
        );
        console.log(
            `${LOG_PREFIX} init OK, isInstallMode=${String(b24.isInstallMode)}, сообщений=${spy.received.length}`,
        );

        // Повторное открытие уже установленного приложения через страницу
        // установки: installFinish запрещён SDK — это успех, а не ошибка.
        if (!b24.isInstallMode) {
            console.log(
                'bx-install: приложение уже установлено (isInstallMode=false)',
            );
            return { finished: false };
        }

        await withTimeout(
            b24.installFinish(),
            'installFinish',
            diagnosticsTail,
        );
        return { finished: true };
    } catch (error) {
        console.error(`${LOG_PREFIX} ОШИБКА`, {
            error: error instanceof Error ? error.message : String(error),
            ...diagnostics,
            messagesFromParent: spy.received,
        });
        throw error;
    } finally {
        spy.stop();
    }
};