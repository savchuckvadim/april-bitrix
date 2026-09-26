import type { Tone } from '@workspace/april-ui';
import type {
    AiRopMark,
    AiRopMarkCallReason,
    AiRopMarkInput,
    AiRopMarkSaveResult,
    AiRopMarkSection,
    AiRopMarkWeek,
    AiRopMarkWeekQuery,
} from '@/modules/entities/ai-analytics/model';
import { formatAiDay } from '@/modules/entities/ai-analytics/lib/ai-metric.util';

/*
 * Чистая логика карточки слепой оценки «три звонка недели» (rop-mark):
 * подписи разделов рубрики и причин подбора, форма метки → тело
 * rop-mark/save, подписи прогресса и заметки после сохранения.
 * Импорты сущности точечные (model / lib), чтобы vitest не тянул UI-кит
 * через барель.
 */

/** Шкала оценки руководителя — та же, что у разбора (зеркало лимитов бэка). */
export const AI_ROP_MARK_SCORE = { min: 1, max: 10 } as const;

/** Длина полей «почему так» и «как лучше» (зеркало лимита бэка). */
export const AI_ROP_MARK_TEXT_MAX = 2000;

/** Кнопки оценки 1…10. */
export const AI_ROP_MARK_SCORES: number[] = Array.from(
    { length: AI_ROP_MARK_SCORE.max - AI_ROP_MARK_SCORE.min + 1 },
    (_, index) => AI_ROP_MARK_SCORE.min + index,
);

/** Разделы рубрики метки в порядке разговора. */
export const AI_ROP_MARK_SECTIONS: {
    code: AiRopMarkSection;
    label: string;
}[] = [
    { code: 'GREETING', label: 'Приветствие' },
    { code: 'NEEDS', label: 'Потребности' },
    { code: 'PRESENTATION', label: 'Презентация' },
    { code: 'OBJECTIONS', label: 'Возражения' },
    { code: 'PRICE', label: 'Цена' },
    { code: 'CLOSING', label: 'Закрытие' },
    { code: 'REFUSAL', label: 'Отказ' },
];

/** Подпись раздела рубрики; неизвестный код — как есть. */
export const aiRopMarkSectionLabel = (code: AiRopMarkSection): string =>
    AI_ROP_MARK_SECTIONS.find(section => section.code === code)?.label ?? code;

/** Причина подбора: тон бэйджа и пояснение (подпись reasonTitle приходит с бэка). */
export const AI_ROP_MARK_REASON: Record<
    AiRopMarkCallReason,
    { tone: Tone; hint: string }
> = {
    uncertain_type: {
        tone: 'warning',
        hint: 'Классификатор определил тип звонка неуверенно — ваша метка уточнит разбор.',
    },
    best_score: {
        tone: 'success',
        hint: 'Лучший балл недели — проверка, не подыгрывает ли разбор метрике.',
    },
    random: {
        tone: 'info',
        hint: 'Случайный звонок недели — контроль без отбора.',
    },
};

/** Значения формы метки; agree = null — руководитель ещё не выбрал. */
export interface AiRopMarkFormValues {
    agree: boolean | null;
    ropScore: number | null;
    sections: AiRopMarkSection[];
    why: string;
    howTo: string;
}

export const emptyAiRopMarkForm = (): AiRopMarkFormValues => ({
    agree: null,
    ropScore: null,
    sections: [],
    why: '',
    howTo: '',
});

/** Форма из уже поставленной метки — для повторной (уже не слепой) метки. */
export const aiRopMarkFormFromMark = (
    mark: AiRopMark,
): AiRopMarkFormValues => ({
    agree: mark.agree,
    ropScore: mark.ropScore,
    sections: [...mark.sections],
    why: mark.why,
    howTo: mark.howTo,
});

/** Переключить раздел; порядок результата — как в рубрике. */
export const toggleAiRopMarkSection = (
    sections: AiRopMarkSection[],
    code: AiRopMarkSection,
): AiRopMarkSection[] => {
    const next = sections.includes(code)
        ? sections.filter(section => section !== code)
        : [...sections, code];
    return AI_ROP_MARK_SECTIONS.map(section => section.code).filter(section =>
        next.includes(section),
    );
};

/** Обрезка текста метки до лимита бэка. */
export const clampAiRopMarkText = (value: string): string =>
    value.length > AI_ROP_MARK_TEXT_MAX
        ? value.slice(0, AI_ROP_MARK_TEXT_MAX)
        : value;

/** Оценка — целое в шкале 1–10. */
export const isAiRopMarkScore = (value: number | null): value is number =>
    value !== null &&
    Number.isInteger(value) &&
    value >= AI_ROP_MARK_SCORE.min &&
    value <= AI_ROP_MARK_SCORE.max;

export const AI_ROP_MARK_AGREE_REQUIRED =
    'Укажите, согласны ли вы с оценкой AI';

/** Ошибка формы; null — можно отправлять. */
export const validateAiRopMarkForm = (
    form: AiRopMarkFormValues,
): string | null => {
    if (form.agree === null) return AI_ROP_MARK_AGREE_REQUIRED;
    if (form.ropScore !== null && !isAiRopMarkScore(form.ropScore)) {
        return `Оценка — целое от ${AI_ROP_MARK_SCORE.min} до ${AI_ROP_MARK_SCORE.max}`;
    }
    return null;
};

/** Текст без крайних пробелов и в лимите; пустой — undefined (поле не шлём). */
const textOrUndefined = (value: string): string | undefined => {
    const trimmed = clampAiRopMarkText(value).trim();
    return trimmed.length ? trimmed : undefined;
};

/**
 * Тело rop-mark/save из формы: пустые поля не шлём, неделя — из запроса
 * списка (та же, что на экране). null — форма не проходит проверку.
 */
export const buildAiRopMarkInput = (
    transcriptionId: string,
    form: AiRopMarkFormValues,
    query: AiRopMarkWeekQuery = {},
): AiRopMarkInput | null => {
    if (form.agree === null || validateAiRopMarkForm(form) !== null) {
        return null;
    }
    const input: AiRopMarkInput = { transcriptionId, agree: form.agree };
    if (form.ropScore !== null) input.ropScore = form.ropScore;
    if (form.sections.length) input.sections = [...form.sections];
    const why = textOrUndefined(form.why);
    if (why) input.why = why;
    const howTo = textOrUndefined(form.howTo);
    if (howTo) input.howTo = howTo;
    if (query.weekKey) input.weekKey = query.weekKey;
    if (query.date) input.date = query.date;
    return input;
};

/** Период недели: «14.09–20.09». */
export const formatAiRopMarkPeriod = (
    week: Pick<AiRopMarkWeek, 'from' | 'to'>,
): string => `${formatAiDay(week.from)}–${formatAiDay(week.to)}`;

export interface AiRopMarkProgress {
    marked: number;
    total: number;
}

/** Сколько звонков подбора уже с меткой. */
export const aiRopMarkProgress = (week: AiRopMarkWeek): AiRopMarkProgress => ({
    marked: week.calls.filter(call => call.marked).length,
    total: week.calls.length,
});

export const formatAiRopMarkProgress = ({
    marked,
    total,
}: AiRopMarkProgress): string => `оценено ${marked} из ${total}`;

/** Заметки после сохранения: прежняя метка заменена; метка уже не слепая. */
export const AI_ROP_MARK_SAVE_NOTES = {
    replaced: 'Прежняя метка заменена — история проверок сохранена.',
    notBlind: 'Оценка AI уже была раскрыта — метка не слепая.',
} as const;

export const aiRopMarkSaveNotes = (
    saved: AiRopMarkSaveResult | null,
): string[] => {
    if (!saved) return [];
    const notes: string[] = [];
    if (saved.replaced) notes.push(AI_ROP_MARK_SAVE_NOTES.replaced);
    if (!saved.blind) notes.push(AI_ROP_MARK_SAVE_NOTES.notBlind);
    return notes;
};

/** Оценка разбора AI (раскрывается после метки): 7.25 → «7,3»; null → «—». */
export const formatAiRopMarkAiScore = (
    value: number | null | undefined,
): string =>
    value === null || value === undefined
        ? '—'
        : value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });

export const AI_ROP_MARK_EMPTY_TEXT = 'На этой неделе подбора нет';

export const AI_ROP_MARK_REMARK_HINT =
    'Повторная метка заменит прежнюю и слепой считаться не будет: оценка AI по звонку уже раскрыта.';
