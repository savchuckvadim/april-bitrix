import { describe, expect, it } from 'vitest';
import {
    ARE_CALLS_ENABLED,
    CALL_FEATURE_KEYS,
    DOMAIN_CONFIG_KEYS,
    getDomainConfig,
} from '../../consts/domain-config';
import type { PortalAppSettings } from '../api/app-config-helper';
import {
    buildAppConfigPatch,
    hasNewConfigValues,
    readPortalStoredKeys,
} from './app-config-patch';

/**
 * Правила отбора портальных настроек.
 *
 * Главное правило: применяем ТОЛЬКО ключи, которые владелец реально сохранил
 * на портале, — их бэк называет списком `storedKeys` рядом со значениями.
 * Остальное в ответе — дефолты реестра, и они не должны гасить доменные.
 *
 * После перевода настроек на кэш эти правила применяются ДВАЖДЫ — к значению
 * из кэша и к тому, что привезло фоновое обновление, — поэтому живут
 * отдельной чистой функцией и проверяются отдельно.
 */

/** Боевой домен со строкой в DOMAIN_OVERRIDES: withTM там включён доменом. */
const DOMAIN = 'gsr.bitrix24.ru';
const CONFIG = getDomainConfig(DOMAIN);

/** Домен без строки в DOMAIN_OVERRIDES: всё на общих дефолтах. */
const CLEAN_DOMAIN = 'no-overrides.bitrix24.ru';
const CLEAN_CONFIG = getDomainConfig(CLEAN_DOMAIN);

/** Ответ нового бэка: значения плоско, рядом — что задано на портале. */
const withStored = (
    settings: PortalAppSettings,
    storedKeys: string[],
): PortalAppSettings => ({ ...settings, storedKeys });

/**
 * Признак, которого спека не допускает: строка, null, разнородный список.
 * Так он приезжает не с бэка, а из браузерного кэша прошлых запусков —
 * описать это типом нечем, поэтому здесь единственное приведение файла.
 */
const withBrokenStored = (storedKeys: unknown): PortalAppSettings =>
    ({ storedKeys }) as PortalAppSettings;

/**
 * Портальное значение ключа, ОТЛИЧНОЕ от действующего, — по типу дефолта:
 * отбор пропускает только совпадающий тип, и подставлять число строковой
 * настройке значило бы проверять не тот фильтр.
 */
const otherValue = (
    current: boolean | number | string,
): boolean | number | string => {
    if (typeof current === 'boolean') return !current;
    if (typeof current === 'string') return `${current}-portal`;
    return 777;
};

describe('buildAppConfigPatch — признак «задано на портале»', () => {
    it('берёт только заданные на портале ключи', () => {
        expect(
            buildAppConfigPatch(
                withStored({ taskGroupId: 88, withChecklistPay: true }, [
                    'taskGroupId',
                    'withChecklistPay',
                ]),
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({ taskGroupId: 88, withChecklistPay: true });
    });

    it('незаданный ключ — дефолт реестра, доменное значение сильнее', () => {
        // Ровно боевое гашение: бэк отдаёт withTM: false ДЕФОЛТОМ КОДА, а на
        // портале его не трогали. Доменный ТМЦ на gsr обязан выжить.
        expect(CONFIG.withTM).toBe(true);
        expect(
            buildAppConfigPatch(
                withStored({ withTM: false, taskGroupId: 88 }, ['taskGroupId']),
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({ taskGroupId: 88 });
    });

    it('gsr выключает доменный withTM из админки', () => {
        // Обратная сторона того же правила: владелец СОХРАНИЛ false —
        // значит флаг снова управляем, и доменное значение уступает.
        const patch = buildAppConfigPatch(
            withStored({ withTM: false }, ['withTM']),
            CONFIG,
            DOMAIN,
        );

        expect(patch).toEqual({ withTM: false });
        expect({ ...CONFIG, ...patch }).toMatchObject({ withTM: false });
    });

    it('gsr ничего не трогал — withTM остаётся включённым', () => {
        const patch = buildAppConfigPatch(
            withStored({ withTM: false }, []),
            CONFIG,
            DOMAIN,
        );

        expect(patch).toEqual({});
        expect({ ...CONFIG, ...patch }).toMatchObject({ withTM: true });
    });

    it('пустой список — портал не задавал ничего, весь ответ отбрасывается', () => {
        // `[]` — осмысленный ответ, а не «признака нет»: все значения в нём
        // дефолтные, применять нечего.
        expect(
            buildAppConfigPatch(
                withStored({ taskGroupId: 88, withChecklistPay: true }, []),
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({});
    });

    it('портал включает флаг, которого домену не задавали', () => {
        const patch = buildAppConfigPatch(
            withStored({ withCheckPresentation: true }, [
                'withCheckPresentation',
            ]),
            CONFIG,
            DOMAIN,
        );

        expect({ ...CONFIG, ...patch }).toMatchObject({
            withCheckPresentation: true,
        });
    });

    it('заданный нулевой идентификатор всё равно не перебивает (инцидент 27.08)', () => {
        // Сентинел сильнее признака: 0 — не только «не задано», но и
        // невалидный Bitrix GROUP_ID.
        expect(
            buildAppConfigPatch(
                withStored({ taskGroupId: 0, bossId: -5 }, [
                    'taskGroupId',
                    'bossId',
                ]),
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({});
    });

    it('общий выключатель звонков сильнее признака', () => {
        // ARE_CALLS_ENABLED = false: даже сохранённые владельцем записи/ИИ
        // не должны вернуться обратно.
        expect(
            buildAppConfigPatch(
                withStored(
                    { withRecords: true, withAI: true, withChecklistPay: true },
                    ['withRecords', 'withAI', 'withChecklistPay'],
                ),
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({ withChecklistPay: true });
    });

    it('заданный ключ с чужим типом отбрасывается', () => {
        expect(
            buildAppConfigPatch(
                withStored({ taskGroupId: '88', withChecklistPay: 'да' }, [
                    'taskGroupId',
                    'withChecklistPay',
                ]),
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({});
    });

    it('сам признак настройкой не становится', () => {
        // `storedKeys` — поле-сосед значений, а не ключ конфига: цикл идёт
        // по DOMAIN_CONFIG_KEYS, поэтому в патч он попасть не может.
        const patch = buildAppConfigPatch(
            withStored({ slaMinutes: 15, taskGroupId: 88 }, [
                'taskGroupId',
                'slaMinutes',
                'storedKeys',
            ]),
            CONFIG,
            DOMAIN,
        );

        expect(patch).toEqual({ taskGroupId: 88 });
        expect('storedKeys' in patch).toBe(false);
    });

    it('каждый ключ реестра управляем с портала (кроме гейта звонков)', () => {
        // Сторож фильтра: новый ключ DomainFeatureConfig должен проходить
        // отбор сам, без правок в app-config-patch. Домен взят БОЕВОЙ, со
        // строкой в DOMAIN_OVERRIDES: с признаком доменные флаги больше не
        // отнимают у портала управление.
        const settings = withStored(
            Object.fromEntries(
                DOMAIN_CONFIG_KEYS.map(key => [key, otherValue(CONFIG[key])]),
            ),
            [...DOMAIN_CONFIG_KEYS],
        );
        const gated: readonly string[] = ARE_CALLS_ENABLED
            ? []
            : CALL_FEATURE_KEYS;

        expect(
            Object.keys(buildAppConfigPatch(settings, CONFIG, DOMAIN)).sort(),
        ).toEqual(
            DOMAIN_CONFIG_KEYS.filter(key => !gated.includes(key)).sort(),
        );
    });
});

describe('buildAppConfigPatch — старый бэк (признака в ответе нет)', () => {
    it('доменный флаг у портала не берётся', () => {
        // Запасной путь isDomainPinnedFlag: без признака «портал не задавал»
        // и «портал задал такое же» у булевых неразличимы, поэтому боевые
        // порталы держит доменная строка.
        expect(CONFIG.withTM).toBe(true);
        expect(buildAppConfigPatch({ withTM: false }, CONFIG, DOMAIN)).toEqual(
            {},
        );

        // Флаг, которого домену не задавали, портал выключает как обычно
        expect(CONFIG.withCheckPresentation).toBe(false);
        expect(
            buildAppConfigPatch(
                { withCheckPresentation: true },
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({ withCheckPresentation: true });
    });

    it('приколочен только флаг: группу задач портал перебивает', () => {
        // У чисел сентинел есть (0 = не задано), поэтому доменный
        // taskGroupId 41 портальному значению не мешает
        expect(CONFIG.taskGroupId).toBe(41);
        expect(
            buildAppConfigPatch({ taskGroupId: 88 }, CONFIG, DOMAIN),
        ).toEqual({ taskGroupId: 88 });
    });

    it('нулевой идентификатор не перебивает рабочее значение (инцидент 27.08)', () => {
        expect(
            buildAppConfigPatch({ taskGroupId: 0, bossId: 0 }, CONFIG, DOMAIN),
        ).toEqual({});
        // Отрицательный — тот же случай «не задано», а не чужая группа
        expect(
            buildAppConfigPatch(
                { taskGroupId: -1, bossId: -5 },
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({});
    });

    it('ключа в ответе нет — остаётся доменный дефолт', () => {
        // Пустой ответ бэка (или ключ, которого в реестре ещё нет) не должен
        // ничего обнулять: фрейм остаётся на том, что уже действует
        const patch = buildAppConfigPatch({ taskGroupId: 88 }, CONFIG, DOMAIN);

        expect('withTM' in patch).toBe(false);
        expect({ ...CONFIG, ...patch }).toMatchObject({
            withTM: CONFIG.withTM,
            withDepartmentModeToggle: CONFIG.withDepartmentModeToggle,
        });
        expect(buildAppConfigPatch({}, CONFIG, DOMAIN)).toEqual({});
    });

    it('на домене без доменных строк портал по-прежнему правит всем', () => {
        const settings = Object.fromEntries(
            DOMAIN_CONFIG_KEYS.map(key => [
                key,
                otherValue(CLEAN_CONFIG[key]),
            ]),
        );
        const gated: readonly string[] = ARE_CALLS_ENABLED
            ? []
            : CALL_FEATURE_KEYS;

        expect(
            Object.keys(
                buildAppConfigPatch(settings, CLEAN_CONFIG, CLEAN_DOMAIN),
            ).sort(),
        ).toEqual(
            DOMAIN_CONFIG_KEYS.filter(key => !gated.includes(key)).sort(),
        );
    });

    it('незнакомые ключи бэка фронту не мешают', () => {
        expect(
            buildAppConfigPatch(
                { slaMinutes: 15, taskGroupId: 88 },
                CONFIG,
                DOMAIN,
            ),
        ).toEqual({ taskGroupId: 88 });
    });
});

describe('readPortalStoredKeys', () => {
    it('пустой список и отсутствие признака — разные ответы', () => {
        // Единственный способ отличить «портал ничего не задавал» от «бэк
        // старый»: форма значения, а не его пустота.
        expect(readPortalStoredKeys({ storedKeys: [] })).toEqual(new Set());
        expect(readPortalStoredKeys({ taskGroupId: 88 })).toBeNull();
    });

    it('битый признак считается отсутствующим', () => {
        // Значение доезжает и из браузерного кэша прошлых запусков — на
        // мусор фрейм обязан уйти на запасной путь, а не упасть.
        expect(readPortalStoredKeys(withBrokenStored('withTM'))).toBeNull();
        expect(readPortalStoredKeys(withBrokenStored(null))).toBeNull();
    });

    it('нестроковые элементы списка отбрасываются', () => {
        expect(
            readPortalStoredKeys(withBrokenStored(['withTM', 7, null])),
        ).toEqual(new Set(['withTM']));
    });
});

describe('hasNewConfigValues', () => {
    it('те же значения при уже помеченных ключах — ничего нового', () => {
        expect(
            hasNewConfigValues({ taskGroupId: CONFIG.taskGroupId }, CONFIG, [
                'taskGroupId',
            ]),
        ).toBe(false);
    });

    it('другое значение — есть что применять', () => {
        expect(
            hasNewConfigValues({ taskGroupId: 88 }, CONFIG, ['taskGroupId']),
        ).toBe(true);
    });

    it('значение совпало, но источник ещё не помечен порталом', () => {
        // configPortalKeys — ответ диагностики на вопрос «настройка портала
        // применилась или мы на хардкоде»: совпадение значений его не заменяет
        expect(
            hasNewConfigValues({ taskGroupId: CONFIG.taskGroupId }, CONFIG, []),
        ).toBe(true);
    });
});
