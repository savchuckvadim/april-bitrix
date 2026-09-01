/**
 * Публичная поверхность сборщика бизнес-метрик для кода приложения.
 *
 * Маршруты (`app/api/metrics/**`) импортируют не отсюда, а прямыми путями к
 * `lib/metric-contract` и `lib/serialize-metric-event`: барель тянет за собой
 * клиент-отправитель, а ему в серверном бандле делать нечего.
 */
export {
    METRIC,
    METRIC_BATCH_VERSION,
    type MetricBatchBody,
    type MetricEvent,
    type MetricName,
    type SerializedMetricEvent,
} from './model/metric-event.type';
export {
    createMetricsClient,
    installMetricsFlushHooks,
    isMetricsEnabled,
    metrics,
    type MetricsClient,
} from './lib/metrics-client';
/**
 * Врезки в бизнес-код ходят ПРЯМЫМ путём (`lib/business-metrics`), а не
 * отсюда: так их видно в импортах вызывающего файла и так их подменяет
 * тест одной строкой. Здесь они перечислены для полноты поверхности слайса.
 */
export {
    countDeliveryAttempt,
    countHiddenChecklistQuestion,
    countReportOutcome,
    countSend,
    observeBootPhase,
    observeBootToTasks,
    publishOutboxLevel,
} from './lib/business-metrics';
