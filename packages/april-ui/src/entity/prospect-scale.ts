/** Код значения прогноза по компании (pbx-поле `op_prospects`). */
export type ProspectCode = 'red' | 'green' | 'yellow';

/** Ступень шкалы прогноза для StepChoiceBar/LiquidChoiceBar. */
export interface ProspectStepView {
    code: ProspectCode;
    label: string;
    color: string;
}

/** Значение enumeration-поля портала: код и подпись. */
export interface ProspectItem {
    code: string;
    name: string;
}

/**
 * Шкала прогноза: три ступени от худшей к лучшей.
 *
 * Порядок здесь — сам смысл шкалы, поэтому массив, а не карта. Цвет ступени
 * прописан явно токеном темы: `red/yellow/green` — коды портального поля, и
 * выводить из них палитру строкой значило бы завязать вёрстку на данные
 * портала. Одна шкала на все приложения — прогноз в «Звонках» и в
 * конструкторе выглядит одинаково.
 */
export const PROSPECT_SCALE: ReadonlyArray<{
    code: ProspectCode;
    name: string;
    /** CSS-цвет ступени: токен темы через var(--…), не hex. */
    cssColor: string;
}> = [
    { code: 'red', name: 'Красный', cssColor: 'var(--destructive)' },
    { code: 'yellow', name: 'Жёлтый', cssColor: 'var(--warning)' },
    { code: 'green', name: 'Зелёный', cssColor: 'var(--success)' },
];

/** Название значения прогноза: портальное, иначе локальное из шкалы. */
export const getProspectName = (
    items: readonly ProspectItem[] | null | undefined,
    code: string | null | undefined,
): string => {
    if (!code) return '';
    const portalName = items?.find(item => item.code === code)?.name;
    if (portalName) return portalName;
    return PROSPECT_SCALE.find(step => step.code === code)?.name ?? '';
};

/**
 * Подписи ступеней берём из ПОРТАЛЬНОГО поля (на портале значение может
 * называться по-своему), а порядок и цвет — из локальной шкалы: она и есть
 * смысл прогноза, портал его не задаёт.
 */
export const getProspectSteps = (
    items: readonly ProspectItem[] | null | undefined,
): ProspectStepView[] =>
    PROSPECT_SCALE.map(step => ({
        code: step.code,
        label: getProspectName(items, step.code),
        color: step.cssColor,
    }));

export interface ProspectCaptionInput {
    /** Ошибка записи прогноза — она сильнее любой подписи. */
    error?: string;
    /** Название текущего значения; пусто — прогноз не задан. */
    currentName?: string;
    /** Название значения под курсором/фокусом; пусто — превью нет. */
    previewName?: string;
}

/**
 * Подпись рядом со шкалой.
 *
 * Одной строкой отвечает на оба вопроса окна предпроверки: что стоит СЕЙЧАС
 * и что станет, если нажать на ступень под курсором. Раньше подпись знала
 * только текущее значение, а заливка шкалы под курсором подменялась превью —
 * и «что стоит» узнать было негде.
 */
export const getProspectCaption = ({
    error,
    currentName,
    previewName,
}: ProspectCaptionInput): string => {
    if (error) return error;
    const now = currentName ? `Сейчас: ${currentName}` : 'Прогноз не задан';
    if (!previewName || previewName === currentName) return now;
    return `${now} → ${previewName}`;
};

/**
 * Все варианты подписи «Сейчас: …» — по ним шапка держит ширину подписи
 * по самому длинному, чтобы смена цвета не сдвигала соседей.
 */
export const getProspectCaptionVariants = (
    steps: readonly ProspectStepView[],
): string[] => [
    ...steps.map(step => getProspectCaption({ currentName: step.label })),
    getProspectCaption({}),
];

/**
 * Что станет при клике — отдельной плашкой, для шапки.
 *
 * В шапке подпись стоит в строке с соседями, и удлинение «Сейчас: X → Y» при
 * наведении сдвигало всё правее — шапка «плясала» (владелец, 06.10.2026).
 * Там подпись остаётся «Сейчас: X», а превью всплывает поверх, не занимая
 * места. null — показывать нечего: ошибка, нет превью или оно совпадает с
 * текущим значением.
 */
export const getProspectPreviewCaption = ({
    error,
    currentName,
    previewName,
}: ProspectCaptionInput): string | null => {
    if (error || !previewName || previewName === currentName) return null;
    return `Станет: ${previewName}`;
};

/** Всё, что нужно шкале прогноза для отрисовки (без записи значения). */
export interface ProspectScaleView {
    steps: ProspectStepView[];
    /** Код текущего значения; null — прогноз не задан. */
    current: ProspectCode | null;
    /** «Сейчас: X → Y» либо текст ошибки записи (окно предпроверки). */
    caption: string;
    /** «Сейчас: X» без превью — подпись шапки, ширина не скачет. */
    currentCaption: string;
    /** «Станет: Y» под курсором — плашка поверх шапки; null — нечего. */
    previewCaption: string | null;
    /** Все варианты «Сейчас: …» — шапка держит ширину по самому длинному. */
    captionVariants: string[];
    isCaptionError: boolean;
    isLoading: boolean;
}

export interface ProspectScaleInput {
    items: readonly ProspectItem[] | null | undefined;
    current: ProspectCode | null;
    /** Ступень под курсором/фокусом; null — превью нет. */
    previewCode: string | null;
    error?: string;
    isLoading: boolean;
}

/**
 * Вид шкалы из данных: ступени, подписи текущего и превью. Откуда значение
 * и как его записать — забота приложения (его хук добавляет select/setPreview).
 */
export const buildProspectScaleView = ({
    items,
    current,
    previewCode,
    error,
    isLoading,
}: ProspectScaleInput): ProspectScaleView => {
    const steps = getProspectSteps(items);
    const captionInput = {
        error,
        currentName: getProspectName(items, current),
        previewName: getProspectName(items, previewCode),
    };
    return {
        steps,
        current,
        caption: getProspectCaption(captionInput),
        currentCaption: getProspectCaption({
            ...captionInput,
            previewName: undefined,
        }),
        previewCaption: getProspectPreviewCaption(captionInput),
        captionVariants: getProspectCaptionVariants(steps),
        isCaptionError: Boolean(error),
        isLoading,
    };
};
