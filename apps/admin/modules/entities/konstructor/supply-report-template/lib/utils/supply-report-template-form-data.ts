/**
 * Сборка `FormData` для multipart-запросов шаблона отчёта о поставке.
 *
 * Отдельный файл, потому что правила сериализации неочевидны и одинаковы
 * для create и update:
 *
 *  - списки уходят JSON-строкой (`["org","ip"]`). Бэкенд разбирает их
 *    `parseMultipartList`, который принимает и JSON, и список через запятую,
 *    но ПУСТУЮ строку превращает в `undefined`. Поэтому пустой список
 *    отправляется именно как `"[]"` — только так update может сбросить
 *    ограничение в NULL;
 *  - boolean уходит `'true'`/`'false'`: `multipart` значений кроме строк и
 *    файлов не знает, а `@Type(() => Boolean)` на бэке получает строку
 *    (`Boolean('false') === true`, поэтому на бэке стоит `enableImplicitConversion`
 *    + явные трансформеры);
 *  - `undefined` поля НЕ добавляются: для update это «не менять».
 */

/** Значение, которое можно положить в multipart. */
type MultipartScalar = string | boolean | number | readonly string[] | File;

const appendScalar = (form: FormData, key: string, value: MultipartScalar): void => {
    if (value instanceof File) {
        form.append(key, value);
        return;
    }
    if (Array.isArray(value)) {
        // JSON, а не повторяющиеся поля: пустой список должен быть различим
        // от «поле не передано», иначе сброс в NULL невыразим.
        form.append(key, JSON.stringify(value));
        return;
    }
    if (typeof value === 'boolean') {
        form.append(key, value ? 'true' : 'false');
        return;
    }
    form.append(key, String(value));
};

/**
 * Объект → `FormData`. Ключи со значением `undefined`/`null` пропускаются.
 */
export function toMultipartFormData(
    payload: Record<string, MultipartScalar | null | undefined>,
): FormData {
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) {
            continue;
        }
        appendScalar(form, key, value);
    }
    return form;
}

/**
 * Query-строка списка. `undefined` и пустые строки отбрасываются, boolean
 * уходит как `true`/`false` (бэкенд приводит их `@Type(() => Boolean)` +
 * `enableImplicitConversion`).
 */
export function toQueryParams(
    query: Record<string, string | number | boolean | undefined>,
): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === '') {
            continue;
        }
        params[key] = typeof value === 'boolean' ? String(value) : String(value);
    }
    return params;
}
