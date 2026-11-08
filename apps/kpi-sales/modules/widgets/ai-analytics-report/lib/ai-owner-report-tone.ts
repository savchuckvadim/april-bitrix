import type { Tone } from '@workspace/april-ui';
import type { AiOwnerReportTone } from '@/modules/entities/ai-analytics';

/** Оценка отчёта → тон april-ui (цвет плиток, бейджей, кромок). */
export const AI_OWNER_REPORT_TONE: Readonly<Record<AiOwnerReportTone, Tone>> = {
    good: 'success',
    warn: 'warning',
    bad: 'destructive',
    neutral: 'neutral',
};

/** Подпись пункта «На что обратить внимание» по его тону. */
export const AI_OWNER_REPORT_ATTENTION_KIND: Readonly<
    Record<AiOwnerReportTone, string>
> = {
    bad: 'Утечка',
    warn: 'Управление',
    good: 'Хорошо',
    neutral: 'Данные',
};

export const AI_OWNER_REPORT_ATTENTION_ACTION = 'Что сделать: ';
