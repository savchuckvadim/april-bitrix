import { BXUser } from '@workspace/bx';

// TODO(migration): перенести конфиг в portal payload / config service —
// сейчас поведение 1:1 с legacy AppSlice + EventTaskThunk (хардкод по доменам).

/** Ключи, которые выключены общим гейтом звонков. */
export const CALL_FEATURE_KEYS = [
    'withRecords',
    'withTranscribation',
    'withAI',
] as const;

/** Фич-флаги и портальные константы, зависящие от домена Bitrix24. */
export interface DomainFeatureConfig {
    withNoPlan: boolean;
    /** перенос события */
    withNoReschedle: boolean;
    withPostFail: boolean;
    withNoCall: boolean;
    withTM: boolean;
    withRecords: boolean;
    withTranscribation: boolean;
    withAI: boolean;
    withPresentationAnimate: boolean;
    withColorRequired: boolean;
    withCheckPresentation: boolean;
    /** Показывать переключатель режима отдела ОП/ТМЦ (legacy: gsr, april-dev). */
    withDepartmentModeToggle: boolean;
    /** Bitrix GROUP_ID группы задач обзвона (legacy EventTaskThunk). */
    taskGroupId: number;
    /** ID руководителя — постановщик планируемых задач (legacy DepartmentSlice). */
    bossId: number;
}

/**
 * Звонки (записи, расшифровка, ИИ-разбор) выключены целиком до отдельной
 * задачи — решение владельца 13.08.2026.
 *
 * Гейт один и стоит ПОСЛЕ доменных исключений: иначе портал, где записи были
 * включены персонально, продолжал бы их грузить. Вернуть — снять этот флаг,
 * код на месте.
 */
export const ARE_CALLS_ENABLED = false;

const DEFAULT_CONFIG: DomainFeatureConfig = {
    withNoPlan: false,
    withNoReschedle: false,
    withPostFail: false,
    withNoCall: false,
    withTM: false,
    withRecords: true,
    withTranscribation: false,
    withAI: false,
    // Кнопка «Провести презентацию» зовёт эхо-кольцами везде: это главный
    // призыв к действию на экране, и выключать его по умолчанию незачем.
    // Флаг остался выключателем для порталов, где презентаций нет.
    withPresentationAnimate: true,
    withColorRequired: false,
    withCheckPresentation: false,
    withDepartmentModeToggle: false,
    taskGroupId: 1,
    bossId: 1,
};

const DOMAIN_OVERRIDES: Record<string, Partial<DomainFeatureConfig>> = {
    'april-dev.bitrix24.ru': {
        withNoPlan: true,
        withNoReschedle: true,
        withPostFail: true,
        withPresentationAnimate: true,
        withColorRequired: true,
        withDepartmentModeToggle: true,
        taskGroupId: 9,
    },
    'gsirk.bitrix24.ru': {
        withNoPlan: true,
        withNoReschedle: true,
        withPostFail: true,
        withPresentationAnimate: true,
        withColorRequired: true,
        withRecords: true,
        withTranscribation: true,
        withAI: true,
        taskGroupId: 107,
        bossId: 2153, // vadim
    },
    'gsr.bitrix24.ru': {
        withTM: true,
        withRecords: true,
        withTranscribation: true,
        withAI: true,
        withDepartmentModeToggle: true,
        taskGroupId: 41,
    },
    'april-garant.bitrix24.ru': {
        withRecords: true,
        withTranscribation: true,
        withAI: true,
        taskGroupId: 28,
        bossId: 107, // fatima
    },
    'alfacentr.bitrix24.ru': {
        withRecords: true,
        withTranscribation: true,
        withAI: true,
        withCheckPresentation: true,
        taskGroupId: 18,
        bossId: 158, // дарья
    },
    'garantservisvoronezh.bitrix24.ru': {
        taskGroupId: 89,
    },
};

/**
 * Конфиг фич по домену + пользовательские исключения
 * (legacy: у пользователя с фамилией «Савчук» всегда включены records/AI).
 */
export const getDomainConfig = (
    domain: string,
    user?: BXUser | null,
): DomainFeatureConfig => {
    const config: DomainFeatureConfig = {
        ...DEFAULT_CONFIG,
        ...(DOMAIN_OVERRIDES[domain] ?? {}),
    };

    if (user?.LAST_NAME === 'Савчук') {
        config.withRecords = true;
        config.withTranscribation = true;
        config.withAI = true;
    }

    // Последним словом — общий выключатель звонков: он сильнее и доменных
    // исключений, и персональных.
    if (!ARE_CALLS_ENABLED) {
        config.withRecords = false;
        config.withTranscribation = false;
        config.withAI = false;
    }

    return config;
};
