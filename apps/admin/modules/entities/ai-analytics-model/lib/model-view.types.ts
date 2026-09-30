import type { StatusTone } from '@workspace/april-ui/tones';

/** Строка «показатель — значение» карточки; `hint` — пояснение в подсказке. */
export interface ModelMetricView {
    label: string;
    value: string;
    hint?: string;
    /** Цвет значения: успех, провал; по умолчанию — обычный текст. */
    tone?: StatusTone;
}

/** Подписи трёх состояний «да / нет / не считалось». */
export interface ModelTriStateLabels {
    yes: string;
    no: string;
    unknown: string;
}
