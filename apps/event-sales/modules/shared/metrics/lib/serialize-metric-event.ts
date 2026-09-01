import {
    METRIC_BATCH_VERSION,
    type MetricBatchBody,
    type MetricEvent,
    type MetricName,
    type SerializedMetricEvent,
} from '../model/metric-event.type';
import {
    DOMAIN_LABEL,
    MAX_EVENTS_PER_BATCH,
    METRIC_KIND,
    UNKNOWN_LABEL_VALUE,
    type MetricSpec,
    findMetricSpec,
    isForbiddenLabelKey,
    sanitizeDomainLabel,
    sanitizeEnumLabelValue,
} from './metric-contract';

/**
 * Приведение события метрики к тому единственному виду, в котором его можно
 * записать в реестр.
 *
 * Функция ОДНА на обе стороны провода: браузер прогоняет через неё событие
 * перед отправкой (мусор не улетает), маршрут приёма — перед инкрементом (не
 * верить клиенту). Второй прогон не лишний: маршрут открыт, и прийти в него
 * может что угодно, включая чужой запрос.
 *
 * Чистая: ни времени, ни сети, ни глобалей — только вход и выход. Поэтому
 * ровно она и покрыта тестами, а не маршрут целиком.
 *
 * `null` означает «событие не записываем»: неизвестная метрика, запрещённая
 * метка, невозможное значение. Молчаливый отказ здесь уместен — метрика,
 * которая роняет запрос или бросает исключение, вредит больше, чем помогает.
 */
export const serializeMetricEvent = (
    raw: unknown,
): SerializedMetricEvent | null => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return null;
    }
    const input = raw as Partial<MetricEvent>;

    const spec = findMetricSpec(input.name);
    if (!spec) return null;

    const rawLabels = input.labels;
    const hasLabels =
        typeof rawLabels === 'object' &&
        rawLabels !== null &&
        !Array.isArray(rawLabels);

    // Запрещённый ключ — не «лишняя метка», а признак утечки идентификатора:
    // событие выбрасывается целиком, ещё до разбора остальных меток.
    if (hasLabels) {
        for (const key of Object.keys(rawLabels)) {
            if (isForbiddenLabelKey(key)) return null;
        }
    }

    // Метки собираются ПО СПЕКЕ, а не по входу: ключей вне списка в серии не
    // окажется никогда, а пропущенные заполнятся `unknown` — иначе prom-client
    // завёл бы вторую серию с пустой меткой на то же самое событие.
    const labels: Record<string, string> = {};
    for (const label of spec.labels) {
        const value = hasLabels
            ? (rawLabels as Record<string, unknown>)[label]
            : undefined;
        labels[label] = resolveLabelValue(spec, label, value);
    }

    const value = normalizeValue(spec, input.value);
    if (value === null) return null;

    return { name: input.name as MetricName, labels, value };
};

/**
 * Значение одной метки. Перечислимая сверяется со списком, домен проходит
 * нормализацию; свободных меток, кроме домена, в контракте нет — если такая
 * появится, она честно станет `unknown`, а не расплодит серии.
 */
const resolveLabelValue = (
    spec: MetricSpec,
    label: string,
    value: unknown,
): string => {
    const allowed = spec.values[label];
    if (allowed) return sanitizeEnumLabelValue(value, allowed);
    return label === DOMAIN_LABEL
        ? sanitizeDomainLabel(value)
        : UNKNOWN_LABEL_VALUE;
};

/**
 * Значение по роду метрики.
 *
 * Счётчику значение не обязательно — «случилось однажды» это `+1`, и заставлять
 * каждый вызов писать единицу незачем. Гистограмме и gauge значение
 * обязательно: наблюдения без числа не существует.
 *
 * Потолок берётся ИЗ СПЕКИ, а не общий. Общий (миллион) для счётчика — ровно
 * то, что нужно, а для гистограммы в секундах он был дырой: миллион уходил в
 * `_sum`, и средняя первая загрузка `rate(_sum)/rate(_count)` оставалась
 * испорченной до рестарта процесса — одной анонимной пачкой.
 */
const normalizeValue = (spec: MetricSpec, raw: unknown): number | null => {
    if (spec.kind === METRIC_KIND.counter) {
        if (raw === undefined || raw === null) return 1;
        if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
        // Счётчик на ноль — шум: серия уже создана, а прироста нет.
        if (raw <= 0) return null;
        return Math.min(raw, spec.maxValue);
    }
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
    // Отрицательное время бута или отрицательный остаток конвертов — это
    // сломанные часы или сломанный вызов, а не наблюдение.
    if (raw < 0) return null;
    return Math.min(raw, spec.maxValue);
};

/**
 * Пачка для отправки: то же самое, но списком и с потолком размера.
 * Всё, что не прошло serializeMetricEvent, просто исчезает.
 */
export const serializeMetricBatch = (
    events: readonly unknown[],
): MetricBatchBody => {
    const serialized: SerializedMetricEvent[] = [];
    for (const event of events) {
        if (serialized.length >= MAX_EVENTS_PER_BATCH) break;
        const item = serializeMetricEvent(event);
        if (item) serialized.push(item);
    }
    return { v: METRIC_BATCH_VERSION, events: serialized };
};

/** Разбор пришедшего тела: версия, форма, состав. Ничего не бросает. */
export const parseMetricBatch = (raw: unknown): SerializedMetricEvent[] => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return [];
    }
    const body = raw as Partial<MetricBatchBody>;
    // Версия пачки — единственный способ отличить несовместимую форму от
    // кривого запроса. Чужая версия молча игнорируется.
    if (body.v !== METRIC_BATCH_VERSION) return [];
    if (!Array.isArray(body.events)) return [];
    return serializeMetricBatch(body.events).events;
};
