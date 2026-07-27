/**
 * Статические таблицы соответствия легаси-адресации (номера, индексы, имена)
 * стабильным кодам. Источник — хардкод старого приложения
 * (front/konstructor/src/modules/redux/reducers/**). Используются:
 * - адаптером from-oldinit (фикстура каталога для тестов),
 * - маппером слепков v1 (entities/snapshot).
 *
 * НЕ ИСТОЧНИК ИСТИНЫ ДЛЯ РАНТАЙМА: веса и метаданные инфоблоков/сервисов
 * живут в БД и приходят через init v2 (каталог). Эти таблицы заморожены —
 * они описывают адресацию СТАРЫХ слепков, которая уже не изменится.
 * Если вес меняется в админке — меняется каталог, сюда лезть не нужно.
 *
 * ВАЖНО: в легаси три разных вида «числа» (см. docs/legacy-core.md):
 * индекс позиции (ers/packetsEr/freeBlocks/consalting/academy),
 * бизнес-number (lt), флаг-массив (star).
 */

/** Легаси-номер комплекта → code (prof-коды из админки, universal — синтез) */
export const COMPLECT_NUMBER_TO_CODE: Record<number, string> = {
    0: 'buh',
    1: 'buhgos',
    2: 'ur',
    3: 'expert',
    4: 'office',
    5: 'glavbuh',
    6: 'glavbuhgos',
    7: 'company',
    8: 'companyPro',
    9: 'classic',
    10: 'classicPlus',
    11: 'universal',
    12: 'universalPlus',
    13: 'professional',
    14: 'master',
    15: 'analyst',
    16: 'analystPlus',
    17: 'maximum',
    18: 'exzak',
    19: 'exbuild',
    20: 'exjobsec',
};

/** Легаси-номер вида поставки (0..18) → (тип, кол-во ОД) для лукапа в каталоге */
export const SUPPLY_NUMBER_TO_KEY: Record<
    number,
    { type: 'internet' | 'proxima'; usersQuantity: number; flash?: boolean }
> = {
    0: { type: 'internet', usersQuantity: 0 }, // Интернет Стандартная
    1: { type: 'internet', usersQuantity: 1 },
    2: { type: 'internet', usersQuantity: 2 },
    3: { type: 'internet', usersQuantity: 3 },
    4: { type: 'internet', usersQuantity: 5 },
    5: { type: 'internet', usersQuantity: 10 },
    6: { type: 'internet', usersQuantity: 20 },
    7: { type: 'internet', usersQuantity: 30 },
    8: { type: 'internet', usersQuantity: 50 },
    9: { type: 'proxima', usersQuantity: 1 }, // Локальная
    10: { type: 'proxima', usersQuantity: 1, flash: true }, // Проксима Флэш
    11: { type: 'proxima', usersQuantity: 1 },
    12: { type: 'proxima', usersQuantity: 2 },
    13: { type: 'proxima', usersQuantity: 3 },
    14: { type: 'proxima', usersQuantity: 5 },
    15: { type: 'proxima', usersQuantity: 10 },
    16: { type: 'proxima', usersQuantity: 20 },
    17: { type: 'proxima', usersQuantity: 30 },
    18: { type: 'proxima', usersQuantity: 50 },
};

/** Синтетический code поставки для фикстуры oldinit (в проде code придёт из БД) */
export const supplyCodeFromNumber = (number: number): string => {
    const key = SUPPLY_NUMBER_TO_KEY[number];
    if (!key) return `supply_${number}`;
    if (number === 0) return 'internet_std';
    if (number === 9) return 'proxima_local';
    if (key.flash) return 'proxima_flash';
    return `${key.type}_${key.usersQuantity}`;
};

/**
 * ЭР: в легаси `ers`/`ersInPacket` — индекс в encyclopedias[1].value,
 * индекс совпадает с number (список хардкод, вес каждой ЭР 0.5).
 */
export const ER_INDEX_TO_CODE: readonly string[] = [
    'erprov', // Проверки организаций и предпринимателей
    'ergos', // Госсектор: учет, отчетность, финконтроль
    'erxs', // Хозяйственные ситуации
    'erzakupki', // Госзакупки
    'erwroks', // Трудовые отношения, кадры
    'ertax', // Налоги и взносы
    'ercontracts', // Договоры и иные сделки
    'ercorp', // Корпоративное право
];

/** Пакеты ЭР: `packetsEr` — индекс в encyclopedias[0].value (у пакетов нет number) */
export const ER_PACKET_INDEX_TO_CODE: readonly string[] = [
    'perbuh', // для бухгалтера
    'pergos', // для бухгалтера госсектора
    'perur', // для юриста
];

/** Состав пакетов ЭР (индексы ЭР из легаси → коды) */
export const ER_PACKET_INCLUDING: Record<string, readonly string[]> = {
    perbuh: ['erprov', 'erxs', 'erwroks', 'ertax', 'ercontracts'], // [0,2,4,5,6]
    pergos: ['ergos', 'erzakupki', 'erwroks', 'ertax', 'ercontracts'], // [1,3,4,5,6]
    perur: ['erprov', 'erzakupki', 'erwroks', 'ercontracts', 'ercorp'], // [0,3,4,6,7]
};

/**
 * Бесплатные блоки: `freeBlocks` — ИНДЕКС ПОЗИЦИИ в freeBlocks.value
 * (поле number у элементов есть, но в легаси НЕ используется!).
 */
export const FREEBLOCK_INDEX_TO_CODE: readonly string[] = [
    'praim', // 0 Прайм
    'archives', // 1 Архивы ГАРАНТа
    'bhome', // 2 Большая домашняя правовая энциклопедия
    'bcaonsalting_free', // 3 База знаний службы ПК (free-версия; в инфоблоках есть свой bcaonsalting)
    'zconsalting', // 4 ГАРАНТ Консалтинг
    'freesud', // 5 Судебная практика: приложение к конс. блокам (isLa)
    'online1', // 6 Онлайн-архив «Практика мировых судей» (isLa)
    'online2', // 7 Онлайн-архив «Определения арбитражных судов» (isLa)
    'pbcaonsalting', // 8 ПК Премиум: База знаний
    'twoconsalting', // 9 2 экспертных заключения в месяц
    'orallyconsalting', // 10 Неограниченные устные консультации
    'ltsemi_free', // 11 Интернет-семинары (free-версия; в LT есть свой ltsemi)
];

/** Легаси-number LT-сервиса → code (числа в lt/ltInPacket — это number, не индекс) */
export const LT_NUMBER_TO_CODE: Record<number, string> = {
    0: 'ltsut',
    1: 'ltconstructor',
    2: 'ltexcontragent',
    3: 'ltdisk',
    4: 'ltconnect',
    5: 'ltbusiness',
    6: 'ltdocmail',
    7: 'ltexsog',
    8: 'ltsemi',
    9: 'ltclassificator',
    10: 'ltpatent',
    11: 'lttender',
    12: 'ltcheckdoc',
    16: 'ltcheckdocprem', // вес 2 («двойной» сервис)
    17: 'ltdigitjobsec',
    19: 'ex_signature',
    1000: 'iscra', // вес 2
    1001: 'iscra_special', // вес 2
};

/** Вес LT-сервиса по коду (по умолчанию 1) */
export const LT_CODE_WEIGHT: Record<string, number> = {
    ltcheckdocprem: 2,
    iscra: 2,
    iscra_special: 2,
};

/** Пакеты LT: суммарный вес ltInPacket → пакет */
export const LT_PACKAGE_BY_WEIGHT: Record<
    number,
    { code: string; number: number; name: string }
> = {
    2: { code: 'ltpackSmall', number: 13, name: 'ГАРАНТ-LegalTech. Малый пакет' },
    5: {
        code: 'ltpackMedium',
        number: 14,
        name: 'ГАРАНТ-LegalTech. Средний пакет',
    },
    10: {
        code: 'ltpackBig',
        number: 15,
        name: 'ГАРАНТ-LegalTech. Большой пакет',
    },
};

/** Консалтинг: индекс == number из init (0/1/2) → code */
export const CONSALTING_INDEX_TO_CODE: readonly string[] = [
    'hotline', // Горячая Линия (всегда, abs 0)
    'sovex', // Советы экспертов (abs 1)
    'pkpremium', // Правовой консалтинг Премиум (abs 3)
];

export const STAR_CODE = 'starpack';

/**
 * Инфоблоки: в легаси filling — точные ИМЕНА. Таблица имя → code
 * (из infoblocks-reducer.js; number там НЕ уникален — джойн только так).
 * «Доп. материалы» не имеют своего кода — идут в паре с родителем.
 */
export const INFOBLOCK_NAME_TO_CODE: Record<string, string> = {
    'Законодательство России': 'rus',
    'Региональное законодательство': 'reg',
    'Отраслевое законодательство': 'ot',
    'Проекты законов': 'pr',
    'Международное право': 'me',
    'Решения Федеральной антимонопольной службы': 'fac',
    'Практика высших судебных органов': 'lv',
    'Практика арбитражных судов округов': 'la',
    'Практика арбитражных апелляционных судов округов': 'laa',
    'Практика судов общей юрисдикции': 'lgeneral',
    'Энциклопедия судебной практики. Правовые позиции судов': 'lencyc',
    'Большая библиотека юриста': 'bbu',
    'Большая библиотека бухгалтера и кадрового работника': 'bbb',
    'Библиотека консультаций. Бухгалтерия предприятия': 'bcompany',
    'Библиотека консультаций. Бюджетные организации': 'bb',
    'Библиотека консультаций. Кадры': 'bkk',
    'Толковый словарь «Бизнес и право»': 'tsbp',
    'Энциклопедия. Законодательство в схемах': 'esx',
    'Энциклопедия. Формы правовых документов': 'eforms',
    'ГАРАНТ-Инфарм': 'infarm',
    'Справочник нормативно-технической документации по строительству': 'ntss',
    'Справочник промышленника': 'sprom',
    'Справочник по охране труда': 'sworks',
    'Справочник по техническому регулированию и стандартизации': 'standart',
    'Справочник строителя': 'buildspec',
    'База знаний службы правового консалтинга': 'bcaonsalting',
    ФАСкейс: 'fascase',
};

/** Дочерние «Доп. материалы» (нет своих кодов) — маппятся в код родителя */
export const INFOBLOCK_CHILD_NAME_TO_PARENT_CODE: Record<string, string> = {
    'Справочник НТД по строительству. Дополнительные материалы': 'ntss',
    'Справочник промышленника. Дополнительные материалы': 'sprom',
};

export const infoblockCodeByName = (name: string): string | null =>
    INFOBLOCK_NAME_TO_CODE[name] ??
    INFOBLOCK_CHILD_NAME_TO_PARENT_CODE[name] ??
    null;

/** Эталонные веса инфоблоков (из infoblocks-reducer.js) */
export const INFOBLOCK_WEIGHT_BY_CODE: Record<string, number> = {
    rus: 0.5,
    reg: 0.5,
    ot: 1,
    pr: 0.5,
    me: 0.5,
    fac: 1,
    lv: 1,
    la: 1,
    laa: 1,
    lgeneral: 1,
    lencyc: 0.5,
    bbu: 1,
    bbb: 1,
    bcompany: 0.5,
    bb: 0.5,
    bkk: 0.5,
    tsbp: 0.5,
    esx: 0.5,
    eforms: 0.5,
    infarm: 1,
    ntss: 1,
    sprom: 3,
    sworks: 1,
    standart: 1,
    buildspec: 2,
    bcaonsalting: 1,
    fascase: 0,
};

/** Группы инфоблоков для фикстуры (code → группа) */
export const INFOBLOCK_GROUP_BY_CODE: Record<string, string> = {
    rus: 'npa',
    reg: 'npa',
    ot: 'npa',
    pr: 'npa',
    me: 'npa',
    fac: 'npa',
    lv: 'sud',
    la: 'sud',
    laa: 'sud',
    lgeneral: 'sud',
    lencyc: 'sud',
    bbu: 'cons',
    bbb: 'cons',
    bcompany: 'cons',
    bb: 'cons',
    bkk: 'cons',
    tsbp: 'spec',
    esx: 'spec',
    eforms: 'spec',
    infarm: 'spec',
    ntss: 'spec',
    sprom: 'spec',
    sworks: 'spec',
    standart: 'spec',
    buildspec: 'spec',
    bcaonsalting: 'spec',
    fascase: 'spec',
};
