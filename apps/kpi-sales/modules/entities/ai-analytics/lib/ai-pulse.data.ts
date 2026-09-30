import type { Tone } from '@workspace/april-ui';
import type {
    AiAgendaItemKind,
    AiPulseAlertKind,
    AiPulseXmrState,
} from '../model';

/** Стабильность доли по дням (состояние последней точки): подпись бэйджа и тон. */
export const AI_XMR_STATE: Record<
    AiPulseXmrState,
    { label: string; hint: string; tone: Tone }
> = {
    in: {
        label: 'в границах',
        hint: 'Последняя дневная доля внутри обычного коридора — процесс стабилен.',
        tone: 'success',
    },
    above: {
        label: 'выше коридора',
        hint: 'Последний день выше обычного коридора — особая причина, стоит понять какая.',
        tone: 'info',
    },
    below: {
        label: 'ниже коридора',
        hint: 'Последний день ниже обычного коридора — дисциплина просела не случайно.',
        tone: 'destructive',
    },
    run: {
        label: 'серия дней',
        hint: 'Несколько дней подряд по одну сторону от обычного уровня — сдвиг процесса, не случайность.',
        tone: 'warning',
    },
};

/** Вид сигнала руководителю: подпись, тон, что значит и что сделать. */
export interface AiAlertKindView {
    label: string;
    tone: Tone;
    /** Что значит сигнал — первая строка подсказки бэйджа. */
    hint: string;
    /** Что руководителю сделать с сигналом. */
    action: string;
}

/** Вид сигнала руководителю (риск-флаг разбора или срочный коучинг). */
export const AI_ALERT_KIND: Record<AiPulseAlertKind, AiAlertKindView> = {
    promise: {
        label: 'Обещание',
        tone: 'warning',
        hint: 'Менеджер пообещал клиенту что-то конкретное: перезвонить, выслать, согласовать.',
        action: 'Проверьте, выполнено ли обещание клиенту, и обсудите с менеджером',
    },
    conflict: {
        label: 'Конфликт',
        tone: 'destructive',
        hint: 'В разговоре был спор или резкий тон с одной из сторон.',
        action: 'Прослушайте звонок и разберите с менеджером тон разговора',
    },
    compliance: {
        label: 'Комплаенс',
        tone: 'destructive',
        hint: 'В звонке есть признаки нарушения регламента разговора с клиентом.',
        action: 'Проверьте звонок на нарушение регламента и при необходимости передайте выше',
    },
    client_negative: {
        label: 'Негатив клиента',
        tone: 'warning',
        hint: 'Клиент выразил недовольство или раздражение.',
        action: 'Перезвоните клиенту или поручите это менеджеру',
    },
    urgent: {
        label: 'Срочно',
        tone: 'destructive',
        hint: 'Разбор поставил звонку срочный приоритет: откладывать разговор с менеджером не стоит.',
        action: 'Разберите звонок с менеджером в ближайший день',
    },
};

/** Подсказка кнопки «Отработано». */
export const AI_ALERT_HANDLED_HINT =
    'Отметьте, когда сигнал разобран с менеджером';

/** Подпись ссылки на карточку разбора звонка. */
export const AI_ALERT_OPEN_LINK_LABEL = 'Открыть разбор';

/** Ссылки нет: элемент разбора ещё не создан. */
export const AI_ALERT_NO_LINK_TEXT = 'разбор ещё не создан';

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
    /** Совет менеджеру: «Сделано» (recommendation_done); key — ключ совета с бэка. */
    lever: (managerId: string, key: string) => `lever:${managerId}:${key}`,
} as const;

/** Пороги «мало данных» (зеркало правил бэка: n < 8 — none, 8–19 — low). */
export const AI_MIN_N_FOR_VALUE = 8;
