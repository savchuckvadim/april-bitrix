import type { Tone } from '@workspace/april-ui';
import type { AiReadinessMode } from '../model';

/** Подпись режима готовности витрины (ReadinessDto.mode) для баннера. */
export const AI_READINESS_LABELS: Record<AiReadinessMode, string> = {
    'kpi-only': 'Только KPI: разборов звонков пока нет',
    calibration: 'Калибровка: данных мало, оценки предварительные',
    descriptive: 'Описательный режим: показываем факты без норм',
    norms: 'Нормы из данных',
    hypothesis: 'Проверка гипотез',
    forecast: 'Прогноз',
    recommendations: 'Рекомендации',
};

/** Пояснение режима человеческим языком (вторая строка баннера). */
export const AI_READINESS_HINTS: Record<AiReadinessMode, string> = {
    'kpi-only':
        'AI-аналитика включена, но за последние 30 дней разборов звонков нет — оценки качества не показываем, доступны только KPI-данные.',
    calibration:
        'Накоплено меньше 3 месяцев истории или меньше 60 разобранных презентаций. Числа несут n и интервал; выводы делать рано.',
    descriptive:
        'Истории достаточно для описания фактов, но нормы ещё не рассчитаны — сравнений «выше/ниже нормы» пока нет.',
    norms: 'Нормы рассчитаны из данных портала: доступны сравнения с нормой.',
    hypothesis: 'Проверяем связь качества и исхода на данных портала.',
    forecast: 'Прогноз строится на накопленной истории.',
    recommendations: 'Рекомендации подтверждены данными.',
};

/** Тон баннера: kpi-only — предупреждение, калибровка — инфо, дальше — норма. */
export const AI_READINESS_TONES: Record<AiReadinessMode, Tone> = {
    'kpi-only': 'warning',
    calibration: 'info',
    descriptive: 'info',
    norms: 'success',
    hypothesis: 'success',
    forecast: 'success',
    recommendations: 'success',
};

/** В kpi-only оценок нет: пульс и повестка не запрашиваются и не рисуются. */
export const isAiKpiOnly = (mode: AiReadinessMode | undefined): boolean =>
    mode === 'kpi-only';
