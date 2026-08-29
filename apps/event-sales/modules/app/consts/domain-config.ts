import { BXUser } from '@workspace/bx';

// КОНФИГ ФРЕЙМА: что приезжает с портала, а что остаётся здесь.
//
// С ПОРТАЛА. Все ключи DomainFeatureConfig заведены в реестре настроек бэка
// (back/libs/portal-lib/store/app-settings/portal-app-settings.schema.ts) и
// приезжают из `/app-settings/event-sales` — кэшом-первым, обновление в
// фоне (model/thunk/AppConfigThunk + lib/cache/app-config-cache). Админка
// строит поля по дескрипторам сама: новый ключ = строка в реестре бэка плюс
// ключ здесь, миграций не нужно.
//
// ЗДЕСЬ. DEFAULT_CONFIG — общий дефолт; DOMAIN_OVERRIDES — ДЕФОЛТЫ ПО
// ДОМЕНАМ: то, с чем боевые порталы жили до админки, и то, что действует,
// пока владелец не решил иначе. Это НЕ приколоченные значения. Плюс
// персональное исключение по фамилии и общий гейт ARE_CALLS_ENABLED. Файл
// не исчезнет и после полного переноса значений: DOMAIN_CONFIG_KEYS — общий
// реестр не только для настроек, по нему же проверяются configKey анкет и
// видимость чек-листов.
//
// КТО КОГО ПЕРЕБИВАЕТ. Ответ бэка везёт рядом со значениями признак
// `storedKeys` — какие ключи владелец РЕАЛЬНО сохранил в админке. Фрейм
// кладёт поверх доменных дефолтов ТОЛЬКО их (lib/config/app-config-patch),
// остальное в ответе — дефолты реестра, и они ничего не решают. Отсюда:
// - портал перебивает домен только ЯВНЫМ сохранением — и включает, и
//   ВЫКЛЮЧАЕТ, в том числе прописанное в DOMAIN_OVERRIDES (gsr выключает
//   withTM из админки, и он выключается);
// - настройка, которой на портале не трогали, доменную не гасит. Ровно
//   этим дефолт реестра false гасил боевые порталы: withNoPlan/withPostFail
//   на gsirk, withTM на gsr, withCheckPresentation на alfacentr;
// - сброс настройки в админке убирает ключ из `storedKeys` — и снова
//   действует доменный дефолт отсюда.
//
// ЗАПАСНОЙ ПУТЬ (старый бэк: признака в ответе нет). Тогда «портал не
// задавал» и «портал задал такое же» у булевых на проводе неразличимы,
// поэтому флаг, ЯВНО прописанный домену, у портала не берётся вовсе
// (isDomainPinnedFlag ниже) — ценой того, что из админки он не
// переключается. Костыль снимается вместе со своей веткой в
// app-config-patch, когда признак будет на всех стендах.
//
// Флаги звонков (withRecords, withTranscribation, withAI) вне этой истории:
// их гасит гейт ARE_CALLS_ENABLED, и портал их сейчас не включит ни с каким
// признаком.

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
    /**
     * Чек-листы pbx-полей (features/CallChecklist): включаются НАСТРОЙКАМИ
     * ПОРТАЛА (админка → Settings → event-sales), в доменном хардкоде только
     * дефолт false. Состав вопросов задаёт портальный каталог анкет
     * (entities/Questionnaire), встроенный набор — data/fallback-catalog.ts.
     */
    withChecklistRefine: boolean;
    withChecklistPay: boolean;
    withChecklistDecision: boolean;
    withChecklistSale: boolean;
    /**
     * Типы события, для которых анкеты ВЫКЛЮЧЕНЫ, — CSV кодов реестра бэка
     * (`presentation,hot`). Единственная строковая настройка реестра:
     * рубильник ПОДСИСТЕМЫ, а не одной анкеты — гасит и те анкеты, которые
     * заведут завтра, поэтому отдельным флагом на анкету его не выразить.
     *
     * Фрейм обязан считать его сам (features/CallChecklist): бэк ответы
     * погашенной анкеты молча выбрасывает, и без этого ключа менеджер
     * отвечал бы в пустоту, а канал `crm` писал бы прямо в портал.
     */
    questionnairesDisabledEventTypes: string;
    /**
     * Вопросы ПРИ ОТЧЁТЕ по типу события (доработка/решение/оплата): один
     * флаг на весь набор — отдельные ключи под каждый тип только засорили
     * бы админку, а включают их всегда вместе.
     */
    withReportQuestions: boolean;
    /** Кнопка «карточка сделки» (слайдер с табом конструктора) в чек-листах. */
    withKonstructorSlider: boolean;
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
    withChecklistRefine: false,
    withChecklistPay: false,
    withChecklistDecision: false,
    withChecklistSale: false,
    // Пусто — анкеты работают на всех типах события; выключает владелец из
    // админки, доменных исключений у выключателя нет и быть не должно.
    questionnairesDisabledEventTypes: '',
    withReportQuestions: false,
    withKonstructorSlider: false,
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
 * ЗАПАСНОЙ ПУТЬ ДЛЯ СТАРОГО БЭКА — того, что отдаёт значения БЕЗ признака
 * `storedKeys`. Флаг со строкой в DOMAIN_OVERRIDES фрейм в этом случае у
 * портала не берёт вовсе.
 *
 * Причина: без признака реестр отдаёт дефолты кода вместе с сохранённым
 * (PortalAppSettingsService.merge), и у булевых «на портале не задано»
 * приезжает обычным false — неотличимо от заданного, боевые порталы теряли
 * бы свои фичи на каждом старте фрейма. Плата — такой флаг не переключается
 * из админки ни в какую сторону. Числа сюда не попадают: у них сентинел 0 =
 * «не задано» (PORTAL_ID_KEYS), и портал их перебивает честно.
 *
 * Признак в ответе есть — это правило НЕ спрашивается совсем
 * (lib/config/app-config-patch), иначе доменный флаг снова стал бы
 * непереключаемым. Удалять функцию вместе с её веткой в app-config-patch,
 * когда `storedKeys` доедет до всех стендов.
 */
export const isDomainPinnedFlag = (
    domain: string,
    key: keyof DomainFeatureConfig,
): boolean =>
    typeof DEFAULT_CONFIG[key] === 'boolean' &&
    DOMAIN_OVERRIDES[domain]?.[key] !== undefined;

/**
 * Реестр настроек, которые фрейм умеет проверять, — ОДИН на всех.
 *
 * Его читают и портальные настройки (какие ключи брать с бэка), и каталог
 * анкет (`configKey` анкеты портал вписывает руками). Два независимых
 * списка разошлись бы, и анкета с ключом «почти как настоящий» пропала бы
 * с экрана молча.
 */
export const DOMAIN_CONFIG_KEYS = Object.keys(
    DEFAULT_CONFIG,
) as (keyof DomainFeatureConfig)[];

/** Такую настройку фрейм знает и может проверить. */
export const isDomainConfigKey = (
    key: string,
): key is keyof DomainFeatureConfig =>
    (DOMAIN_CONFIG_KEYS as readonly string[]).includes(key);

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
