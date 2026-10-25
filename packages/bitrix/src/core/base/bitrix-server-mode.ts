/**
 * РАБОТА ЧЕРЕЗ СЕРВЕР, КОГДА У СОТРУДНИКА НЕ ХВАТАЕТ ПРАВ.
 *
 * Решение владельца (22–25.10.2026): приложение выполняет свои функции
 * независимо от прав сотрудника — права на порталах бывают настроены как
 * угодно. Первый отказ Битрикса «нет доступа» во фрейме переключает
 * транспорт: этот запрос и все следующие идут через наш сервер (он
 * выполняет их вебхуком портала). Это не повтор каждого запроса, а смена
 * режима — до конца работы во вкладке.
 *
 * Сам транспорт (HTTP к серверу, сессия) даёт приложение: пакет bitrix
 * не знает про бэк.
 */

/** Команда пакета в форме фрейма — как её хранит BitrixBaseApi. */
export interface BitrixServerCommand {
    method: string;
    params?: unknown;
}

/** Ответ пакета с сервера: результаты и ошибки по ключам команд. */
export interface BitrixServerBatchAnswer {
    result: Record<string, unknown>;
    errors: Record<string, unknown>;
}

export interface BitrixServerTransport {
    /**
     * Один метод. Возвращает полный ответ Битрикса ({ result, total, next,
     * time }) — как getData() у SDK; ошибку Битрикса бросает.
     */
    call(method: string, params: unknown): Promise<unknown>;
    /** Пакет команд в форме фрейма. */
    batch(
        commands: Record<string, BitrixServerCommand>,
    ): Promise<BitrixServerBatchAnswer>;
}

/** Почему переключились: метод и текст отказа Битрикса. */
export interface BitrixServerModeEvent {
    method: string;
    reason: string;
}

export type BitrixServerModeListener = (event: BitrixServerModeEvent) => void;

const DENIED_CODES = new Set([
    'ACCESS_DENIED',
    'ERROR_ACCESS_DENIED',
    'INSUFFICIENT_SCOPE',
]);

const DENIED_TEXT =
    /access denied|permission denied|доступ запрещ|недостаточно прав|нет прав|не разрешено/i;

const textField = (value: unknown): string =>
    typeof value === 'string' ? value : '';

/** Отказ Битрикса по правам — код или текст ошибки (SDK, batch, сервер). */
export function isBitrixAccessDenied(error: unknown): boolean {
    if (typeof error === 'string') return DENIED_TEXT.test(error);
    if (!error || typeof error !== 'object') return false;
    const e = error as Record<string, unknown>;
    const code = (textField(e.code) || textField(e.error)).toUpperCase();
    if (DENIED_CODES.has(code)) return true;
    const text = [e.message, e.description, e.error_description]
        .map(textField)
        .join(' ');
    return DENIED_TEXT.test(text);
}

/** Текст отказа для журнала. */
export function describeBitrixError(error: unknown): string {
    if (typeof error === 'string') return error;
    if (!error || typeof error !== 'object') return 'неизвестная ошибка';
    const e = error as Record<string, unknown>;
    const code = textField(e.code) || textField(e.error);
    const text =
        textField(e.description) ||
        textField(e.error_description) ||
        textField(e.message);
    return [code, text].filter(Boolean).join(': ') || 'неизвестная ошибка';
}

/** Ссылка на результат команды: `$result[key]`, `$result[key][ID]`. */
const RESULT_REF = /^\$result\[([^\]]+)\]((?:\[[^\]]*\])*)$/;

const isScalar = (value: unknown): value is string | number | boolean =>
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean';

/**
 * Подставить в параметры результаты команд, уже выполненных во фрейме.
 *
 * Упавшие команды досылаются через сервер отдельным пакетом, и ссылки на
 * успевшие во фрейме соседние команды там не разрешатся — подставляем их
 * значения заранее. Ссылки на команды, которые тоже досылаются, оставляем:
 * их разрешит сам batch на сервере.
 */
export function resolveFrameRefs(
    value: unknown,
    results: Record<string, unknown>,
    pending: ReadonlySet<string>,
): unknown {
    if (typeof value === 'string') {
        const match = RESULT_REF.exec(value);
        if (!match) return value;
        const key = match[1] ?? '';
        if (pending.has(key) || !(key in results)) return value;
        let current: unknown = results[key];
        for (const segment of (match[2] ?? '').matchAll(/\[([^\]]*)\]/g)) {
            if (!current || typeof current !== 'object') return value;
            current = (current as Record<string, unknown>)[segment[1] ?? ''];
        }
        return isScalar(current) ? current : value;
    }
    if (Array.isArray(value)) {
        return value.map(item => resolveFrameRefs(item, results, pending));
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                resolveFrameRefs(item, results, pending),
            ]),
        );
    }
    return value;
}

/** Упавшие во фрейме команды — пакетом для сервера. */
export function buildServerRetry(
    commands: Record<string, BitrixServerCommand>,
    frameResults: Record<string, unknown>,
    failedKeys: readonly string[],
): Record<string, BitrixServerCommand> {
    const pending = new Set(failedKeys);
    const retry: Record<string, BitrixServerCommand> = {};
    for (const key of failedKeys) {
        const command = commands[key];
        if (!command) continue;
        retry[key] = {
            method: command.method,
            params: resolveFrameRefs(command.params, frameResults, pending),
        };
    }
    return retry;
}

/**
 * Режим «через сервер» одного BitrixBaseApi: транспорт, флаг и правила
 * переключения. BitrixBaseApi спрашивает его перед каждым вызовом.
 */
export class BitrixServerMode {
    private transport: BitrixServerTransport | null = null;
    private listener: BitrixServerModeListener | null = null;
    private active = false;

    /** Приложение подключает свой транспорт (и слушателя переключения). */
    connect(
        transport: BitrixServerTransport,
        listener: BitrixServerModeListener | null = null,
    ): void {
        this.transport = transport;
        this.listener = listener;
    }

    /** Запросы идут через сервер. */
    get isActive(): boolean {
        return this.active && this.transport !== null;
    }

    /** Включить режим; повторный вызов ничего не делает. */
    activate(event: BitrixServerModeEvent): void {
        if (this.active) return;
        this.active = true;
        this.listener?.(event);
    }

    /** Отказ фрейма — повод перейти на сервер (транспорт подключён). */
    canTakeOver(error: unknown): boolean {
        return this.transport !== null && isBitrixAccessDenied(error);
    }

    /** Переключиться из-за отказа и выполнить этот же вызов через сервер. */
    async takeOver(
        method: string,
        params: unknown,
        error: unknown,
    ): Promise<unknown> {
        this.activate({ method, reason: describeBitrixError(error) });
        return this.call(method, params);
    }

    /** Полный ответ Битрикса — тип ответа знает вызывающий BitrixBaseApi. */
    call(method: string, params: unknown): Promise<unknown> {
        return this.requireTransport().call(method, params);
    }

    /** Пакет через сервер; результат — как у SDK: успешные по ключам. */
    async batch(
        commands: Record<string, BitrixServerCommand>,
    ): Promise<Record<string, unknown>> {
        if (!Object.keys(commands).length) return {};
        return (await this.requireTransport().batch(commands)).result;
    }

    /**
     * Пакет фрейма отработал. Если среди ошибок есть отказ по правам —
     * переключаемся и досылаем через сервер все упавшие команды (зависимые
     * от отказавших падают с другой ошибкой, поэтому досылаем все).
     */
    async completeFrameBatch(
        commands: Record<string, BitrixServerCommand>,
        frameResults: Record<string, unknown>,
        errors: ReadonlyMap<unknown, unknown> | null | undefined,
    ): Promise<Record<string, unknown>> {
        if (!this.transport || !errors?.size) return frameResults;
        const failed = [...errors.entries()];
        const denied = failed.find(([, error]) => isBitrixAccessDenied(error));
        if (!denied) return frameResults;

        const deniedKey = String(denied[0]);
        this.activate({
            method: commands[deniedKey]?.method ?? 'batch',
            reason: describeBitrixError(denied[1]),
        });
        const retry = buildServerRetry(
            commands,
            frameResults,
            failed.map(([key]) => String(key)),
        );
        return { ...frameResults, ...(await this.batch(retry)) };
    }

    private requireTransport(): BitrixServerTransport {
        if (!this.transport) {
            throw new Error('Работа через сервер не подключена');
        }
        return this.transport;
    }
}
