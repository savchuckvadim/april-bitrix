import type { Tone } from '@workspace/april-ui';
import type {
    AiAboutDataQuality,
    AiAboutEndpoint,
    AiAboutEstimandKind,
    AiAboutEstimate,
    AiAboutEstimateSource,
    AiAboutModel,
    AiAboutParamKind,
    AiAboutParamLayer,
    AiAboutParamReason,
    AiAboutParamValue,
    AiReadinessSigmaSource,
} from '@/modules/entities/ai-analytics';

/*
 * Блок «Как считаем» (ручка about): подписи кодов DTO по-русски и
 * форматирование значений. Слова про смысл ручки приходят с бэка
 * (title/purpose/sources/…), здесь — только словари enum'ов и числа.
 */

/** Ручка витрины → заголовок диалога, пока данных ещё нет. */
export const AI_ABOUT_ENDPOINT_LABELS: Record<AiAboutEndpoint, string> = {
    overview: 'Обзор менеджер × тип',
    'plan/daily': 'План дня',
    brief: 'AI-резюме периода',
    'manager/style': 'Карточка стиля менеджера',
    'plan-fact': 'План — факт месяца',
    dossier: 'Досье менеджера',
};

/** Слой, давший значение параметра (менеджер → полоса стажа → портал → реестр). */
export const AI_ABOUT_LAYER_LABELS: Record<AiAboutParamLayer, string> = {
    default: 'реестр (по умолчанию)',
    portal: 'настройка портала',
    tenure: 'полоса стажа',
    manager: 'настройка менеджера',
    hybrid: 'настройка + данные',
};

/** Класс параметра: решение человека, оценка из данных, прайор до гейта. */
export const AI_ABOUT_KIND: Record<
    AiAboutParamKind,
    { label: string; tone: Tone }
> = {
    configured: { label: 'настроен', tone: 'info' },
    estimated: { label: 'оценён по данным', tone: 'success' },
    hybrid: { label: 'прайор → данные', tone: 'accent' },
};

/** Почему значение слоя портала не применено и взят дефолт реестра. */
export const AI_ABOUT_REASON_LABELS: Record<AiAboutParamReason, string> = {
    'out-of-range': 'значение портала вне допустимого диапазона — взят дефолт',
    'type-mismatch': 'у значения портала другой тип — взят дефолт',
    'invalid-value': 'значение портала не из словаря — взят дефолт',
    'unknown-code': 'код не найден в реестре — взят дефолт',
};

/** Источник оценки модели (κ / φ / λ). */
export const AI_ABOUT_ESTIMATE_SOURCE_LABELS: Record<
    AiAboutEstimateSource,
    string
> = {
    estimated: 'оценено по данным портала',
    configured: 'настройка портала или реестра',
    hybrid: 'настроенный прайор до гейта',
};

/** Трактовка рёбер воронки портала. */
export const AI_ABOUT_ESTIMAND_KIND_LABELS: Record<
    AiAboutEstimandKind,
    string
> = {
    rate: 'интенсивность на агрегатах (rate)',
    prob: 'вероятность эпизода после сцепки звонков со сделками (prob)',
};

/** Качество данных санити-панели недели. */
export const AI_ABOUT_DATA_QUALITY: Record<
    AiAboutDataQuality,
    { label: string; tone: Tone }
> = {
    ok: { label: 'метки времени в порядке', tone: 'success' },
    flagged: { label: 'протечка меток времени выше порога', tone: 'warning' },
    unknown: { label: 'плацебо-тест не отработал', tone: 'muted' },
};

/** Бэйдж параметра, смена которого рвёт сравнимость рядов. */
export const AI_ABOUT_BREAKS_SERIES_LABEL = 'рвёт ряд';

/** Число по-русски: до трёх знаков после запятой, без хвостовых нулей. */
export const formatAiAboutNumber = (value: number): string =>
    value.toLocaleString('ru-RU', { maximumFractionDigits: 3 });

/** Действующее значение параметра с единицей: 8 шт., 0,35, да / нет. */
export const formatAiAboutParamValue = (
    value: AiAboutParamValue,
    unit: string,
): string => {
    if (typeof value === 'boolean') return value ? 'да' : 'нет';
    const text =
        typeof value === 'number' ? formatAiAboutNumber(value) : value.trim();
    const suffix = unit.trim();
    return suffix ? `${text} ${suffix}` : text;
};

/** Значение оценки модели; null — модель его не несёт. */
export const formatAiAboutEstimateValue = (value: number | null): string =>
    value === null ? '—' : formatAiAboutNumber(value);

/** Оценки модели в порядке формул: κ, φ, λ. */
export const aiAboutEstimates = (model: AiAboutModel): AiAboutEstimate[] => [
    model.kappa,
    model.phi,
    model.lambda,
];

/** Дата YYYY-MM-DD → «07.09.2026»; пусто — «—». */
export const formatAiAboutDate = (value: string | null | undefined): string => {
    if (!value) return '—';
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}.${year}` : value;
};

/** Окно норм: «2026-06 – 2026-08 (3 мес.)»; один месяц — как есть. */
export const formatAiAboutWindow = (window: readonly string[]): string => {
    const first = window[0];
    const last = window[window.length - 1];
    if (!first || !last) return '—';
    if (window.length === 1) return first;
    return `${first} – ${last} (${window.length} мес.)`;
};

/** Начало сравнимой истории; пусто/null — ряд не рвался. */
export const formatAiAboutComparableFrom = (
    value: string | null | undefined,
): string =>
    value
        ? `сравнимая история с ${formatAiAboutDate(value)}`
        : 'ряд параметров не рвался';

/** Доля сцепки звонков со сделками, %. */
export const formatAiAboutChainShare = (pct: number): string =>
    `${formatAiAboutNumber(Math.round(pct * 10) / 10)} %`;

const VERSION_VISIBLE = 12;

/** Версия набора параметров (sha256) укорачивается до префикса. */
export const shortAiAboutVersion = (version: string): string =>
    version.length > VERSION_VISIBLE + 4
        ? `${version.slice(0, VERSION_VISIBLE)}…`
        : version;

/* ---------- Надёжность оценщика (Фаза 3, П7) ---------- */

/** Источник σ_llm: измерена повтором разборов или взята из реестра. */
export const AI_ABOUT_SIGMA_SOURCE_LABELS: Record<AiReadinessSigmaSource, string> = {
    measured: 'измерена повтором разборов',
    configured: 'значение реестра',
};

/** Поля разбора, по которым меряется согласие повторного прогона (коды бэка). */
export const AI_ABOUT_RELIABILITY_CATEGORY_LABELS: Record<string, string> = {
    callType: 'тип звонка',
    productive: 'звонок продуктивный',
    refusalCategory: 'категория отказа',
    coachingPriority: 'приоритет коучинга',
    nextStepSet: 'следующий шаг назначен',
};

/** κ / F1 двумя знаками; null — «не измерено». */
export const formatAiAboutKappa = (value: number | null): string =>
    value === null ? 'не измерено' : value.toFixed(2).replace('.', ',');
