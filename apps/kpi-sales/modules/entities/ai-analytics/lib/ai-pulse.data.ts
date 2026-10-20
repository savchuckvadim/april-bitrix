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

/**
 * Вид сигнала руководителю: действующий риск-флаг разбора с цитатой
 * (конфликт, регламент, закрытая дверь) или срочный коучинг. Сигналы
 * «обещание» и «негатив клиента» отменены (решение владельца 19.10.2026):
 * это обычная работа с клиентом, а не повод для руководителя.
 */
export const AI_ALERT_KIND: Record<AiPulseAlertKind, AiAlertKindView> = {
    conflict: {
        label: 'Конфликт',
        tone: 'destructive',
        hint: 'Менеджер говорил с клиентом резко или грубо — есть дословная цитата.',
        action: 'Прослушайте звонок и разберите с менеджером тон разговора',
    },
    compliance: {
        label: 'Регламент',
        tone: 'destructive',
        hint: 'В звонке есть явное нарушение регламента разговора с клиентом — есть дословная цитата.',
        action: 'Проверьте звонок на нарушение регламента и при необходимости передайте выше',
    },
    door_closed: {
        label: 'Дверь закрыта',
        tone: 'warning',
        hint: 'После отказа клиента менеджер не оставил дверь открытой: не договорился ни о поводе вернуться, ни о новом предложении.',
        action: 'Разберите с менеджером, как после отказа договариваться о возврате: срок, повод, новое предложение',
    },
    urgent: {
        label: 'Срочно',
        tone: 'destructive',
        hint: 'Разбор поставил звонку срочный приоритет: откладывать разговор с менеджером не стоит.',
        action: 'Разберите звонок с менеджером в ближайший день',
    },
};

/** Вид сигнала из старого разбора, которого в словаре больше нет. */
export const AI_ALERT_KIND_UNKNOWN: AiAlertKindView = {
    label: 'Прочий сигнал',
    tone: 'muted',
    hint: 'Сигнал старого разбора, который больше не считается поводом для руководителя.',
    action: 'Откройте разбор и решите сами, нужен ли разговор с менеджером',
};

/** Подпись вида сигнала; незнакомый вид (старый кэш) — «Прочий сигнал». */
export const aiAlertKindView = (kind: string): AiAlertKindView =>
    (AI_ALERT_KIND as Record<string, AiAlertKindView | undefined>)[kind] ??
    AI_ALERT_KIND_UNKNOWN;

/**
 * Подсказка кнопки «Отработано» — подробно (что изменится, кто видит,
 * отменить нельзя, в Битрикс24 ничего не уходит) в AI_PULSE_TEXT.handled
 * (ai-pulse.texts.ts); здесь — её заголовок для старых вызовов.
 */
export const AI_ALERT_HANDLED_HINT = 'Отработано';

/** Подпись ссылки на карточку разбора звонка. */
export const AI_ALERT_OPEN_LINK_LABEL = 'Открыть разбор';

/** Ссылки нет: элемент разбора ещё не создан. */
export const AI_ALERT_NO_LINK_TEXT = 'разбор ещё не создан';

/** Класс причины попадания звонка в повестку планёрки: подпись, тон, подсказка. */
export interface AiAgendaKindView {
    label: string;
    tone: Tone;
    /** Что это за причина и что сделать на планёрке. */
    hint: string;
}

/**
 * Причины повестки в порядке приоритета (решение владельца 19.10.2026):
 * слабая презентация → слабая доработка → низкая оценка → риск с цитатой;
 * спорное возражение и слабый раздел — запасные причины.
 */
export const AI_AGENDA_KIND: Record<AiAgendaItemKind, AiAgendaKindView> = {
    weak_presentation: {
        label: 'Слабая презентация',
        tone: 'warning',
        hint: 'У презентации слабо выявлены потребности или показ не привязан к ним. Разберите с менеджером, какие вопросы задать и как связать показ с задачами клиента.',
    },
    weak_followup: {
        label: 'Слабая доработка',
        tone: 'warning',
        hint: 'В звонке после презентации возражение осталось без ответа или следующий шаг без даты. Разберите с менеджером ответ на возражение и договорённость о дате.',
    },
    low_score: {
        label: 'Низкая оценка',
        tone: 'info',
        hint: 'Общая оценка звонка не выше порога. Прослушайте звонок и разберите с менеджером самый слабый раздел.',
    },
    risk: {
        label: 'Риск',
        tone: 'destructive',
        hint: 'Конфликт, нарушение регламента или закрытая после отказа дверь — с дословной цитатой. Прослушайте звонок и обсудите с менеджером.',
    },
    objection: {
        label: 'Спорное возражение',
        tone: 'warning',
        hint: 'Возражение клиента не отработано или клиент отстранился. Разберите с менеджером, как ответить.',
    },
    section: {
        label: 'Слабый раздел',
        tone: 'info',
        hint: 'Самый слабый раздел разговора по оценке разбора. Разберите с менеджером фразы «как можно иначе».',
    },
};

/** Причина из старого кэша, которой в словаре больше нет. */
export const AI_AGENDA_KIND_UNKNOWN: AiAgendaKindView = {
    label: 'Прочая причина',
    tone: 'muted',
    hint: 'Причина из старого расчёта повестки. Откройте разбор и решите, стоит ли обсуждать звонок.',
};

/** Подпись причины повестки; незнакомая (старый кэш) — «Прочая причина». */
export const aiAgendaKindView = (kind: string): AiAgendaKindView =>
    (AI_AGENDA_KIND as Record<string, AiAgendaKindView | undefined>)[kind] ??
    AI_AGENDA_KIND_UNKNOWN;

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
