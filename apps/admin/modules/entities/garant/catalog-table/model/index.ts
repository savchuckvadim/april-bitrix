import type {
    CatalogSeedRequestDtoSectionsItem,
    TableImportReportDto,
    TableImportSkippedRowDto,
} from '@workspace/nest-admin-api';

/** Таблицы каталога, доступные для выгрузки и загрузки */
export const CATALOG_TABLE_KINDS = [
    'prices',
    'supplies',
    'complects',
] as const;

export type CatalogTableKind = (typeof CATALOG_TABLE_KINDS)[number];

/** Что скачиваем: текущие данные или пустой шаблон */
export type CatalogExportMode = 'current' | 'blank';

export type CatalogSeedSection = CatalogSeedRequestDtoSectionsItem;

export type { TableImportReportDto, TableImportSkippedRowDto };

/** Описание таблицы каталога для интерфейса */
export interface CatalogTableInfo {
    kind: CatalogTableKind;
    /** Название в интерфейсе */
    title: string;
    /** Что меняется этой таблицей — одной строкой */
    summary: string;
    /** Имя файла при скачивании */
    fileName: string;
    /** Пошаговая инструкция «как заполнять» */
    instructions: string[];
    /** Важные предупреждения (выводятся отдельным блоком) */
    warnings?: string[];
    /**
     * Можно ли скачать пустой шаблон (строки-ключи без значений) —
     * чтобы вносить прайс с нуля, не стирая старые цифры руками.
     */
    canDownloadBlank?: boolean;
}

/**
 * Инструкции по каждой таблице — показываются на странице рядом с
 * кнопками, чтобы порядок действий не приходилось держать в голове.
 */
/**
 * Первая таблица в списке — она же таб по умолчанию. Вынесена отдельной
 * константой, чтобы обращение к ней не требовало проверки на undefined.
 */
export const CATALOG_TABLES: readonly [
    CatalogTableInfo,
    ...CatalogTableInfo[],
] = [
    {
        kind: 'prices',
        title: 'Цены',
        summary:
            'Вся книга цен одним файлом: прайс PROF, стоимость рабса по регионам, веса и АБС универсальной линейки, пакеты услуг и консалтинг.',
        fileName: 'garant-prices.xlsx',
        canDownloadBlank: true,
        instructions: [
            'Листы «prof-prices-msc» (Москва) и «prof-prices-regions» (регионы): строка — комплект, колонка — число одновременных доступов (ОД). Эти цены приходят прайсом от поставщика, система их не вычисляет.',
            'Лист «regions» — стоимость рабса в каждом регионе, колонка «rabs». От неё считаются цены универсальной линейки и консалтинга, поэтому её важно держать актуальной. Рабс с НДС система считает сама.',
            'Лист «universal-weights» — вес и АБС универсальных комплектов. Цен там нет: цена считается как АБС, умноженный на стоимость рабса региона и на коэффициент вида поставки.',
            'Листы «lt» и «star» — вес и цены пакетов услуг для Москвы и регионов. Лист «consalting» — АБС продуктов консалтинга, цен там тоже нет.',
            'Меняйте только значения. Имена листов, коды в строках и заголовки колонок не трогайте — по ним система понимает, к чему относится цифра.',
            'Пустая ячейка значит «не менять» — можно прислать файл только с теми значениями, которые правили.',
        ],
        warnings: [
            'Цена в колонке ОД действует на все способы доставки с этим числом доступов: Интернет и Проксима отличаются способом, а не ценой. Стандартная, Локальная и Флэш берут цену колонки «1 ОД».',
            'Комплекты универсальной линейки в прайс вписывать не надо — их цена вычисляется, такие строки будут отклонены.',
        ],
    },
    {
        kind: 'supplies',
        title: 'Виды поставок',
        summary:
            'Параметры видов поставок без цен: число ОД, коэффициент и шаблоны текстов для договоров и предложений.',
        fileName: 'garant-supplies.xlsx',
        instructions: [
            'Колонка «coefficient» — множитель цены для универсальной линейки, «usersQuantity» — число одновременных доступов. На цены PROF коэффициент не влияет: они приходят прайсом.',
            'Остальные колонки — тексты, которые попадают в договоры и коммерческие предложения.',
            'В текстах работает подстановка числа ОД: {n} — цифрой, {words} — прописью, {plural:ОД|ОД|ОД} — нужная форма слова.',
            'Новый вид поставки — новая строка: заполните «code», «type» (internet или proxima), «name» и «usersQuantity».',
        ],
    },
    {
        kind: 'complects',
        title: 'Комплекты и пакеты',
        summary:
            'Карточки комплектов и пакетов услуг: названия, рабсы, порядок, признаки.',
        fileName: 'garant-complects.xlsx',
        instructions: [
            'Лист «complects» — комплекты, лист «packages» — пакеты услуг.',
            'Колонка «abs» — АБС. У универсальной линейки и консалтинга цена считается от него. Его же можно править в книге цен — там он на листах «universal-weights» и «consalting».',
            'Колонка «type»: prof или universal. Колонка «productType»: garant, lt, star или consalting.',
        ],
        warnings: [
            'Состав инфоблоков в этой таблице не меняется — он правится в карточке комплекта, чтобы файл не мог случайно его обнулить.',
        ],
    },
];

export const DEFAULT_CATALOG_TABLE: CatalogTableInfo = CATALOG_TABLES[0];

export const catalogTableInfo = (kind: CatalogTableKind): CatalogTableInfo =>
    CATALOG_TABLES.find(table => table.kind === kind) ?? DEFAULT_CATALOG_TABLE;

/** Секции сида и их описания для интерфейса */
export interface CatalogSeedSectionInfo {
    section: CatalogSeedSection;
    title: string;
    description: string;
}

export const CATALOG_SEED_SECTIONS: readonly CatalogSeedSectionInfo[] = [
    {
        section: 'supplies',
        title: 'Виды поставок',
        description:
            'Создаёт стандартный набор видов поставок: Интернет и Проксима на 1–50 ОД, Стандартная, Локальная, Флэш. Коэффициенты и тексты договоров потом заполняются таблицей.',
    },
    {
        section: 'universalComplects',
        title: 'Универсальная линейка',
        description:
            'Создаёт комплекты от Классика до Максимума с их рабсами. Состав инфоблоков добавляется потом в карточке каждого комплекта.',
    },
    {
        section: 'servicePackages',
        title: 'Пакеты услуг',
        description:
            'Создаёт пакеты ЛегалТех (малый, средний, большой), СТАР и продукты консалтинга с рабсами. Цены ЛегалТеха и СТАРа заполняются таблицей цен.',
    },
];

/** Сводка отчёта импорта для показа одной строкой */
export interface ImportSummary {
    created: number;
    updated: number;
    unchanged: number;
    skipped: number;
    hasChanges: boolean;
}

export const summarizeReports = (
    reports: TableImportReportDto[],
): ImportSummary => {
    const summary = reports.reduce(
        (acc, report) => ({
            created: acc.created + report.created,
            updated: acc.updated + report.updated,
            unchanged: acc.unchanged + report.unchanged,
            skipped: acc.skipped + report.skipped.length,
        }),
        { created: 0, updated: 0, unchanged: 0, skipped: 0 },
    );
    return {
        ...summary,
        hasChanges: summary.created > 0 || summary.updated > 0,
    };
};
