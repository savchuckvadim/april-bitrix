/**
 * Проверка черновика методики на одном звонке: типы ответа
 * `admin/methodologies/preview` (написаны руками по DTO бэкенда до
 * перегенерации клиента) и тексты вкладки.
 */

export type MethodologyPreviewStatus = 'queued' | 'running' | 'done' | 'failed';

export type PreviewCheckpointStatus = 'done' | 'missed' | 'not_applicable';

export interface PreviewCheckpoint {
    code: string;
    title: string;
    status: PreviewCheckpointStatus;
    mandatory: boolean;
    /** Кто определил статус: модель или правило кода по фактам. */
    source: 'model' | 'rule';
    quote: string | null;
    startSec: number | null;
    endSec: number | null;
}

export interface PreviewSpiral {
    need: string | null;
    feature: string | null;
    link: string | null;
    benefit: string | null;
    question: string | null;
    clientAnswer: string | null;
    full: boolean;
}

export interface PreviewCap {
    code: string;
    title: string;
    /** Код раздела или `total` — итоговая оценка. */
    target: string;
    max: number;
    before: number | null;
    after: number | null;
    applied: boolean;
}

export interface PreviewOutcome {
    code: string;
    version: string;
    title: string;
    checkpoints: PreviewCheckpoint[];
    checkpointsDone: number;
    checkpointsTotal: number;
    spirals: PreviewSpiral[] | null;
    spiralsFull: number | null;
    spiralsMinFull: number | null;
}

export interface MethodologyPreviewResult {
    callType: string | null;
    /** У методики есть пункты или спирали для типа этого звонка. */
    applicable: boolean;
    methodology: PreviewOutcome | null;
    capsTriggered: PreviewCap[];
    scoreBefore: number | null;
    scoreAfter: number | null;
    model: string | null;
    tokens: number | null;
}

export interface MethodologyPreviewState {
    previewId: string;
    status: MethodologyPreviewStatus;
    domain: string;
    transcriptionId: string;
    error: string | null;
    result: MethodologyPreviewResult | null;
    updatedAt: string;
}

export interface MethodologyPreviewStart {
    domain: string;
    transcriptionId: string;
    config: unknown;
}

/** Номер расшифровки — целое число. */
export const TRANSCRIPTION_ID_PATTERN = /^\d{1,18}$/;

export const METHODOLOGY_PREVIEW_TEXT = {
    intro:
        'Проверьте черновик на одном уже разобранном звонке до сохранения и ' +
        'включения: один вызов модели по пунктам этой методики. Методика, ' +
        'разбор звонка и карточка в Битрикс24 не меняются.',
    noDomain: 'Выберите портал над списком методик — проверка идёт на его звонке.',
    transcription: 'Номер расшифровки звонка',
    transcriptionHint:
        'Номер — колонка «ID» в списке «Транскрипции» портала (портал → ' +
        'Statistics → «Транскрипции»). Звонок должен быть уже разобран.',
    transcriptionInvalid: 'Номер расшифровки — целое число.',
    run: 'Проверить на звонке',
    running: 'Проверяю…',
    startError: 'Проверка не запущена',
    queued: 'Проверка в очереди…',
    inProgress: 'Модель проверяет звонок по пунктам методики — обычно до двух минут.',
    failed: 'Проверка не выполнена',
    stateError: 'Не удалось получить состояние проверки',
    notApplicable:
        'У методики нет пунктов и спиралей для типа этого звонка — проверять нечего. Выберите звонок другого типа или добавьте тип в методику.',
    callType: (title: string): string => `Тип звонка: ${title}`,
    checkpoints: (done: number, total: number): string =>
        `Обязательных пунктов выполнено: ${done} из ${total}`,
    spirals: (full: number, min: number): string =>
        `Полных витков спирали: ${full}, по методике нужно не меньше ${min}`,
    score: (before: string, after: string): string =>
        `Итоговая оценка: сейчас ${before}, с этой методикой ${after}`,
    scoreSame: (score: string): string => `Итоговая оценка не меняется: ${score}`,
    noScore: 'нет',
    statusDone: 'выполнен',
    statusMissed: 'пропущен',
    statusNotApplicable: 'неприменим',
    optional: 'необязательный',
    byRule: 'посчитан по фактам разбора',
    noQuote: 'цитаты нет',
    capsTitle: 'Сработавшие ограничители',
    capsNone: 'Ограничители не сработали.',
    capApplied: (title: string, target: string, before: string, after: string): string =>
        `${title} — ${target}: ${before} → ${after}`,
    capNotApplied: (title: string, target: string, max: number): string =>
        `${title} — ${target}: условие выполнено, оценка и так не выше ${max}`,
    targetTotal: 'итоговая оценка',
    usage: (model: string | null, tokens: string | null): string =>
        `Ответила модель ${model ?? 'портала'}${tokens ? `, токенов ${tokens}` : ''}.`,
} as const;
