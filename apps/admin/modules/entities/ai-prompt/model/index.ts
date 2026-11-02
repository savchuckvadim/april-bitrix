import type {
    LlmPromptRunDto,
    LlmPromptRunResultDto,
    LlmPromptTargetDto,
    LlmPromptTargetsDto,
    LlmPromptUsageDto,
} from '@workspace/nest-admin-api';

/**
 * Типы раздела «Запрос к модели» — сгенерированные DTO бэка admin
 * (`LlmPromptController`, `admin/llm-prompt`). Состав исполнителей и их
 * подписи приходят с бэка; фронт только показывает и отправляет.
 */
export type LlmPromptRun = LlmPromptRunDto;
export type LlmPromptTarget = LlmPromptRunDto['target'];
export type LlmPromptRunResult = LlmPromptRunResultDto;
export type LlmPromptUsage = LlmPromptUsageDto;
export type LlmPromptTargetInfo = LlmPromptTargetDto;
export type LlmPromptTargets = LlmPromptTargetsDto;

export const AI_PROMPT_PATH = '/ai-analytics/prompt';

/** Исполнитель по умолчанию — порядок провайдеров разборов. */
export const AI_PROMPT_DEFAULT_TARGET: LlmPromptTarget = 'auto';

/** Сентинел комбобокса «без портала» (Radix не принимает пустую строку). */
export const AI_PROMPT_NO_PORTAL = '__no_portal__';

export const AI_PROMPT_TEXT = {
    title: 'Запрос к модели',
    intro:
        'Разовый запрос любой моделью теми же ключами и провайдерами, что и разборы звонков: проверить формулировку промпта, прогнать документ, сравнить ответы. Ответ нигде не сохраняется; вызов платный и пишется в журнал.',
    portal: 'Портал',
    portalPlaceholder: 'Без портала — общие ключи приложения',
    portalSearch: 'Поиск по домену',
    portalEmpty: 'Порталов не найдено',
    portalHint:
        'Нужен для VibeCode и своего сервиса портала. «Как разборы звонков» без портала берёт общий порядок приложения.',
    noPortal: 'Без портала — общие ключи приложения',
    target: 'Исполнитель',
    targetsLoading: 'Загружаю исполнителей…',
    targetsError: 'Не удалось загрузить исполнителей',
    unavailable: (issue: string): string => `недоступен: ${issue}`,
    model: 'Модель VibeCode',
    modelPlaceholder: 'bitrix/bitrixgpt-5.5 — пусто: модель по умолчанию',
    systemPrompt: 'Системный промпт',
    systemPromptPlaceholder:
        'Роль и правила. Пусто — нейтральный ассистент, отвечающий по-русски.',
    userContent: 'Текст запроса',
    userContentPlaceholder:
        'Сам промпт или данные: расшифровка звонка, документ, вопрос…',
    run: 'Выполнить',
    running: 'Модель отвечает…',
    runHint: 'Ctrl+Enter — выполнить',
    result: 'Ответ',
    resultEmpty: 'Ответ появится здесь.',
    copy: 'Скопировать ответ',
    copied: 'Ответ скопирован',
    copyFailed: 'Не удалось скопировать',
    failed: 'Модель не ответила',
    chars: (count: number): string => `${count.toLocaleString('ru-RU')} зн.`,
} as const;
