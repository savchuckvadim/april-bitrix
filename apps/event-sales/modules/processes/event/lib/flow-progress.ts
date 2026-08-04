/**
 * Шаги, которые показываем, пока летит запрос отправки отчёта.
 *
 * ЧЕСТНО О ПРИРОДЕ ЭТИХ ШАГОВ: телеметрии с бэкенда нет — эндпоинт отдаёт
 * один ответ в конце. Шаги переключаются по времени и лишь ПРИБЛИЖАЮТ реальный
 * порядок работы `EventReportUseCase` (сущность → сделки → задачи → KPI).
 * Поэтому здесь нет процентов и нет обещания «осталось N секунд»: показываем
 * только то, чем сервер занят по смыслу. Финальный экран рисуется строго по
 * настоящему ответу, а не по таймеру.
 *
 * Когда на бэкенде появится очередь со статусом задачи — этот файл заменяется
 * маппингом реальных стадий, а UI не трогаем.
 */
export interface FlowProgressStep {
    /** С какой секунды показывать шаг. */
    fromMs: number;
    title: string;
    hint: string;
}

export const FLOW_PROGRESS_STEPS: FlowProgressStep[] = [
    {
        fromMs: 0,
        title: 'Сохраняем отчёт',
        hint: 'записываем комментарий и статус работы',
    },
    {
        fromMs: 2500,
        title: 'Обновляем сделки и задачи',
        hint: 'двигаем стадии и закрываем текущее событие',
    },
    {
        fromMs: 6000,
        title: 'Записываем в отчётность',
        hint: 'событие попадёт в KPI отдела',
    },
];

/** Сколько ждём, прежде чем сказать «дольше обычного». */
export const FLOW_SLOW_AFTER_MS = 15000;

/**
 * Заставки на время ожидания.
 *
 * Смысл не декоративный: очередь работает секунды, и всё это время экран
 * должен чем-то жить, иначе ожидание читается как зависание. Картинки
 * сменяют друг друга, поэтому долгое ожидание не выглядит одинаковым кадром.
 *
 * Для скринридера они пустые (`alt=""`): содержательной информации не несут,
 * состояние операции читается из заголовка шага.
 */
export interface FlowShowcaseImage {
    src: string;
}

export const FLOW_SHOWCASE_IMAGES: FlowShowcaseImage[] = [
    { src: '/process/megamenu-img.png' },
    { src: '/process/verification-img.png' },
    { src: '/process/profile-img.png' },
];

/** Не мигаем с первой секунды: короткая отправка должна пройти без картинок. */
export const FLOW_SHOWCASE_START_MS = 1500;

/** Как часто меняется кадр. Кратно тику прогресса (1с) — смены равномерные. */
export const FLOW_SHOWCASE_INTERVAL_MS = 3000;

export const getFlowShowcaseImage = (
    elapsedMs: number,
): FlowShowcaseImage | null => {
    if (elapsedMs < FLOW_SHOWCASE_START_MS) return null;

    const index =
        Math.floor(
            (elapsedMs - FLOW_SHOWCASE_START_MS) / FLOW_SHOWCASE_INTERVAL_MS,
        ) % FLOW_SHOWCASE_IMAGES.length;

    return FLOW_SHOWCASE_IMAGES[index] ?? null;
};

export const getFlowProgressStep = (elapsedMs: number): FlowProgressStep => {
    let step = FLOW_PROGRESS_STEPS[0]!;
    for (const candidate of FLOW_PROGRESS_STEPS) {
        if (elapsedMs >= candidate.fromMs) step = candidate;
    }
    return step;
};

export const getIsFlowSlow = (elapsedMs: number): boolean =>
    elapsedMs >= FLOW_SLOW_AFTER_MS;
