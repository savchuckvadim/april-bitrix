import type { ComboboxOption } from '@workspace/april-ui/fields';
import type { AiAnalyticsAuditPortalStatus } from '../../model';

/** Значения формы запуска и варианты выбора. */
export interface AuditFormState {
    domain?: string;
    /** Поле месяцев как ввёл владелец — валидность считается отдельно. */
    monthsRaw: string;
    timeZone: string;
    save: boolean;
    isMonthsValid: boolean;
    portalOptions: ComboboxOption[];
}

/** Обработчики формы запуска. */
export interface AuditFormActions {
    selectDomain: (domain: string) => void;
    setMonthsRaw: (raw: string) => void;
    setTimeZone: (timeZone: string) => void;
    setSave: (save: boolean) => void;
}

/** Кнопки «Запустить» / «Показать последний снапшот» и их состояние. */
export interface AuditRunControls {
    canRun: boolean;
    canShowLatest: boolean;
    isRunning: boolean;
    isLatestLoading: boolean;
    run: () => void;
    showLatest: () => void;
}

/**
 * Состояние выбранного портала: рубильник AI-аналитики, признак аудита,
 * последний снапшот — плюс куда идти включать и что говорит бэк о доступе.
 */
export interface AuditPortalState {
    status: AiAnalyticsAuditPortalStatus | null;
    isLoading: boolean;
    /** Ссылка на настройки приложений портала, где включаются признаки. */
    settingsHref: string | null;
    /** Кто и при каком признаке может запускать — текст about.access с бэка. */
    accessText: string | null;
}
