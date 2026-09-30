import type { StatusTone } from '@workspace/april-ui/tones';
import type {
    ModelFeedbackKind,
    ModelForecastBacktestStatus,
    ModelLever,
    ModelPoolStatus,
    ModelQualityLinkStatus,
    ModelRecommendationGateStatus,
} from '../model';

/**
 * Словари кодов бэка → русские подписи. Раздел — инструмент разработчика:
 * код показывается рядом с подписью, но подпись всегда по-русски.
 * Неизвестный код (бэк добавил новый) не роняет экран: подпись берётся
 * нейтральная — см. `lib/model-code-label.util.ts`.
 */

/** Статус с тоном бэйджа. */
export interface ModelStatusLabel {
    label: string;
    tone: StatusTone;
}

/** Словарь «код → подпись»; ключи — строки бэка. */
export type ModelCodeDictionary = Readonly<Record<string, string>>;

/** Виды записей обратной связи (`kind` сводки). */
export const FEEDBACK_KIND_LABEL: Record<ModelFeedbackKind, string> = {
    view: 'Просмотр витрины',
    useful: 'Полезно',
    not_useful: 'Не полезно',
    disagree: 'Не согласен',
    alert_sent: 'Отправлено оповещение',
    alert_handled: 'Оповещение отработано',
    digest_sent: 'Отправлена утренняя сводка',
    agenda_sent: 'Отправлена повестка',
    rop_mark: 'Слепая оценка руководителя',
    recommendation_issued: 'Выдан совет',
    recommendation_done: 'Совет выполнен',
};

/** Итог проверки точности прогноза (гейт ступени «прогноз»). */
export const BACKTEST_STATUS_LABEL: Record<ModelForecastBacktestStatus, ModelStatusLabel> = {
    pass: { label: 'Проверка пройдена', tone: 'success' },
    fail: { label: 'Проверка не пройдена', tone: 'destructive' },
    insufficient: { label: 'Мало данных', tone: 'muted' },
};

/** Итог гейта ступени «советы». */
export const EFFECT_GATE_STATUS_LABEL: Record<ModelRecommendationGateStatus, ModelStatusLabel> = {
    pass: { label: 'Гейт пройден', tone: 'success' },
    fail: { label: 'Гейт не пройден', tone: 'destructive' },
    insufficient: { label: 'Мало данных', tone: 'muted' },
};

/** Статус связи качества с результатом. */
export const QUALITY_LINK_STATUS_LABEL: Record<ModelQualityLinkStatus, ModelStatusLabel> = {
    insufficient: { label: 'Мало данных', tone: 'muted' },
    estimated: { label: 'Оценена, не опубликована', tone: 'warning' },
    published: { label: 'Опубликована', tone: 'success' },
};

/** Статус пула порталов. */
export const POOL_STATUS_LABEL: Record<ModelPoolStatus, ModelStatusLabel> = {
    insufficient: { label: 'Мало порталов', tone: 'muted' },
    estimated: { label: 'Пул собран', tone: 'success' },
};

/** Неизвестный статус с бэка — нейтрально, без падения. */
export const UNKNOWN_STATUS_LABEL: ModelStatusLabel = {
    label: 'Неизвестный статус',
    tone: 'neutral',
};

/** Причины проверки точности прогноза (`AI_FORECAST_BACKTEST_REASONS`). */
export const BACKTEST_REASON_LABEL: ModelCodeDictionary = {
    'not-enough-months': 'Закрытых месяцев с фактом меньше нужного',
    'no-days': 'В месяцах нет ни одного дня с прогнозом',
    'coverage-below': 'Факт попадает в вилку реже цели',
    'mase-naive': 'Ошибка не ниже, чем у прогноза «по темпу с начала месяца»',
    'mase-mean3': 'Ошибка не ниже, чем у «среднего за три месяца»',
    'mase-undefined': 'Сравнить ошибку не с чем: у простого прогноза она нулевая',
};

/** Причины связи качества с результатом и её гейта. */
export const QUALITY_LINK_REASON_LABEL: ModelCodeDictionary = {
    'no-stage-history': 'Нет истории стадий сделок',
    'no-calls': 'Нет разобранных звонков',
    'sample-below-min': 'Выборка меньше минимальной',
    'not-converged': 'Модель не сошлась',
    'se-missing': 'Нет погрешности общей оценки',
    'se-above-target': 'Погрешность общей оценки выше целевой',
    'calibration-missing': 'Калибровка не считалась',
    'calibration-not-covering-one': 'Калибровка смещена: интервал наклона не накрывает единицу',
    'placebo-failed': 'Проверка на подставных данных не пройдена',
    'timestamp-leak': 'Слишком много записей с датой из будущего',
};

/** Причины пропусков пула. */
export const POOL_REASON_LABEL: ModelCodeDictionary = {
    'too-few-portals': 'Мало порталов в пуле',
    'too-few-portals-beta': 'Мало порталов с оценкой связи качества',
    'no-lag-data': 'Нет данных о сроках сделок',
    'no-lognormal-data': 'Нет данных о разбросе сумм',
    'season-not-estimated': 'Сезонность не оценена',
};

/** Вердикт по порталу пула. */
export const POOL_PORTAL_REASON_LABEL: ModelCodeDictionary = {
    included: 'Вошёл в пул',
    'no-consent': 'Нет согласия',
    'consent-not-yet': 'Согласие дано позже месяца сборки',
    'short-history': 'Короткая история',
};

/** Причины гейта ступени «советы» (`RECOMMENDATION_GATE_REASONS`). */
export const EFFECT_GATE_REASON_LABEL: ModelCodeDictionary = {
    'issued-below-min': 'Советов с закрытым окном меньше минимума',
    'issued-below-n-min': 'Выдано слишком мало советов для долей',
    'done-share-below': 'Доля выполненных ниже порога',
    'disagree-above': 'Доля несогласий выше порога',
    'no-positive-edge': 'Ни один шаг воронки уверенно не вырос',
    'goodhart-flags': 'Есть признаки подгонки показателей',
};

/** Направления советов. */
export const LEVER_LABEL: Record<ModelLever, string> = {
    volume: 'Объём звонков',
    quality: 'Качество разговора',
    checklist: 'Чек-лист разговора',
    pipeline: 'Воронка сделок',
    objection: 'Работа с возражениями',
};

/**
 * Коды шагов воронки в `beforeAfter[].edge` эффекта советов: коды витрины
 * (`AI_ANALYTICS_FUNNEL_EDGES` / `AI_ANALYTICS_EDGE_VIEW_CODES` бэка), а не
 * канонические e1…e5 реестра — эффект считается по рёбрам месячных
 * снапшотов менеджера.
 */
export const MODEL_FUNNEL_EDGE_CODES = [
    'call_to_presentation',
    'presentation_to_offer',
    'offer_to_invoice',
    'invoice_to_sale',
] as const;
export type ModelFunnelEdgeCode = (typeof MODEL_FUNNEL_EDGE_CODES)[number];

/** Шаги воронки эффекта советов. */
export const EDGE_LABEL: Record<ModelFunnelEdgeCode, string> = {
    call_to_presentation: 'От звонка к презентации',
    presentation_to_offer: 'От презентации к КП',
    offer_to_invoice: 'От КП к счёту',
    invoice_to_sale: 'От счёта к продаже',
};

/** Метка оценки пула. */
export const POOL_BETA_LABEL: ModelCodeDictionary = {
    estimated: 'По данным пула',
    hybrid: 'С опорой на справочное значение',
};
