import type { Tone } from '@workspace/april-ui';
import type {
    AiAgendaItemKind,
    AiPulseAlertKind,
    AiPulseXmrState,
} from '../model';

/** Состояние XmR по последней точке — подпись и тон. */
export const AI_XMR_STATE: Record<
    AiPulseXmrState,
    { label: string; hint: string; tone: Tone }
> = {
    in: {
        label: 'в границах',
        hint: 'Последняя дневная доля внутри контрольных границ — процесс стабилен.',
        tone: 'success',
    },
    above: {
        label: 'выше границы',
        hint: 'Последняя точка выше верхней контрольной границы — особая причина, стоит понять какая.',
        tone: 'info',
    },
    below: {
        label: 'ниже границы',
        hint: 'Последняя точка ниже нижней контрольной границы — дисциплина просела не случайно.',
        tone: 'destructive',
    },
    run: {
        label: 'серия',
        hint: 'Несколько дней подряд по одну сторону от центра — сдвиг процесса, не шум.',
        tone: 'warning',
    },
};

/** Вид сигнала руководителю (риск-флаг разбора или срочный коучинг). */
export const AI_ALERT_KIND: Record<
    AiPulseAlertKind,
    { label: string; tone: Tone }
> = {
    promise: { label: 'Обещание', tone: 'warning' },
    conflict: { label: 'Конфликт', tone: 'destructive' },
    compliance: { label: 'Комплаенс', tone: 'destructive' },
    client_negative: { label: 'Негатив клиента', tone: 'warning' },
    urgent: { label: 'Срочно', tone: 'destructive' },
};

/** Класс причины попадания звонка в повестку планёрки. */
export const AI_AGENDA_KIND: Record<
    AiAgendaItemKind,
    { label: string; tone: Tone }
> = {
    risk: { label: 'Риск-флаг', tone: 'destructive' },
    objection: { label: 'Спорное возражение', tone: 'warning' },
    section: { label: 'Слабый раздел', tone: 'info' },
};

/** Объекты реакций витрины (feedback.object). */
export const AI_FEEDBACK_OBJECT = {
    PULSE: 'pulse',
    AGENDA: 'agenda',
    OVERVIEW: 'overview',
    call: (transcriptionId: string) => `call:${transcriptionId}`,
    /** Карточка «Внимание»: полезно / не полезно. */
    attention: (managerId: string, signal: string) =>
        `attention:${managerId}:${signal}`,
    /** Строка таблицы сигналов: «Не согласен». */
    managerRow: (managerId: string) => `overview:${managerId}`,
} as const;

/** Пороги «мало данных» (зеркало правил бэка: n < 8 — none, 8–19 — low). */
export const AI_MIN_N_FOR_VALUE = 8;
