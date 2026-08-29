import type { PortalAppSettings } from '../api/app-config-helper';
import {
    ARE_CALLS_ENABLED,
    CALL_FEATURE_KEYS,
    DOMAIN_CONFIG_KEYS,
    DomainFeatureConfig,
    isDomainPinnedFlag,
} from '../../consts/domain-config';

/**
 * Ключи-ИДЕНТИФИКАТОРЫ портала: 0 означает «на портале не задано», и
 * такое значение НЕ должно затирать рабочее значение по домену.
 *
 * Инцидент 27.08: у настройки группы задач стоял дефолт 1, бэк отдаёт
 * дефолты вместе с сохранёнными значениями — незаполненная настройка
 * приезжала как настоящая единица, перебивала рабочую группу портала,
 * и список дел оказывался пустым (задачи искались в чужой группе).
 *
 * Проверка остаётся и при живом признаке `storedKeys`: `taskGroupId <= 0` —
 * это не только «не задано», но и невалидный Bitrix GROUP_ID.
 */
const PORTAL_ID_KEYS: ReadonlySet<keyof DomainFeatureConfig> = new Set([
    'taskGroupId',
    'bossId',
]);

/**
 * Ключи, ЗАДАННЫЕ на портале; `null` — признака в ответе нет.
 *
 * Различать можно только по форме значения, ни в коем случае не по
 * пустоте: `[]` — это осмысленный ответ «портал не задавал ничего, всё
 * приехавшее — дефолты реестра», а `null` — «бэк старый (или в кэше лежит
 * запись прошлой формы), признаку взяться неоткуда».
 *
 * Поле читается по имени из типизированного ответа, но значение всё равно
 * проверяется в рантайме и потому объявлено `unknown`: спека обещает
 * `string[]`, а сюда приезжает и запись браузерного кэша прошлого запуска,
 * которую никакая спека не описывает. Проверка формы — не перестраховка, а
 * единственный вход на запасной путь.
 */
export const readPortalStoredKeys = (
    settings: PortalAppSettings,
): ReadonlySet<string> | null => {
    const raw: unknown = settings.storedKeys;

    if (!Array.isArray(raw)) return null;

    return new Set(raw.filter((key): key is string => typeof key === 'string'));
};

/**
 * Портальные настройки (ответ бэка как есть) → патч поверх доменного
 * конфига.
 *
 * Чистая функция и единственное место правил отбора. Порядок правил:
 * 1. общий выключатель звонков сильнее всего;
 * 2. нулевой идентификатор — «не задано», а не значение;
 * 3. ПРИЗНАК `storedKeys`: берутся ТОЛЬКО ключи, сохранённые владельцем на
 *    портале; всё остальное в ответе — дефолты реестра, и доменное значение
 *    сильнее их. Признака нет (старый бэк) — работает запасной путь с
 *    `isDomainPinnedFlag`;
 * 4. известный ключ реестра с совпадающим типом (SLA-ключи, само поле
 *    `storedKeys` и будущие серверные настройки фронту не мешают: цикл идёт
 *    по `DOMAIN_CONFIG_KEYS`, а не по ключам ответа).
 *
 * Вынесена из thunk'а потому, что после перевода настроек на кэш эти же
 * правила применяются ДВАЖДЫ: к значению из кэша и к тому, что привезло
 * фоновое обновление.
 */
export const buildAppConfigPatch = (
    settings: PortalAppSettings,
    defaults: DomainFeatureConfig,
    domain: string,
): Partial<DomainFeatureConfig> => {
    const patch: Partial<DomainFeatureConfig> = {};
    const storedKeys = readPortalStoredKeys(settings);

    for (const key of DOMAIN_CONFIG_KEYS) {
        // Общий выключатель звонков сильнее портальных настроек:
        // иначе включённые на портале записи вернулись бы обратно.
        if (
            !ARE_CALLS_ENABLED &&
            (CALL_FEATURE_KEYS as readonly string[]).includes(key)
        ) {
            continue;
        }

        const value = settings[key];

        // «Не задано» для идентификаторов — не значение, а пустота.
        if (
            PORTAL_ID_KEYS.has(key) &&
            (typeof value !== 'number' || value <= 0)
        ) {
            continue;
        }

        if (storedKeys) {
            // Бэк сказал, что владелец сохранял на портале: применяем ровно
            // это. Остальные ключи ответа — дефолты реестра, и принимать их
            // за решение владельца нельзя (дефолт false гасил withNoPlan,
            // withTM, withCheckPresentation на боевых порталах). Зато
            // сохранённое применяется КАК ЕСТЬ: портал может и включить, и
            // выключить то, что задано домену.
            if (!storedKeys.has(key)) continue;
        } else if (isDomainPinnedFlag(domain, key)) {
            // ЗАПАСНОЙ ПУТЬ ДЛЯ СТАРОГО БЭКА (снять, когда признак
            // `storedKeys` будет на всех стендах). Без признака «портал не
            // задавал» и «портал задал такое же» у булевых неразличимы,
            // поэтому флаг, явно прописанный домену, у портала не берётся —
            // ценой того, что из админки он не переключается.
            continue;
        }

        if (value !== undefined && typeof value === typeof defaults[key]) {
            Object.assign(patch, { [key]: value });
        }
    }

    return patch;
};

/**
 * В патче есть что-то, чего в действующем конфиге ещё нет.
 *
 * Нужна фоновому обновлению: настройки перечитываются на каждый старт, и
 * почти всегда привозят ровно то, что уже действует. Диспатчить `mergeConfig`
 * ради тех же значений — значит без повода будить листенер перезапроса дел
 * и мусорить в консоль.
 *
 * Ключ, значение которого совпало, но который ещё не помечен портальным,
 * тоже считается новым: `configPortalKeys` — это ответ диагностики на вопрос
 * «настройка портала применилась или мы на хардкоде».
 */
export const hasNewConfigValues = (
    patch: Partial<DomainFeatureConfig>,
    config: DomainFeatureConfig,
    portalKeys: readonly string[],
): boolean =>
    (Object.keys(patch) as (keyof DomainFeatureConfig)[]).some(
        key => patch[key] !== config[key] || !portalKeys.includes(key),
    );
