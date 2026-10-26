import type {
    CatalogSeedRequestDtoSectionsItem,
    TableImportReportDto,
    TableImportSkippedRowDto,
} from '@workspace/nest-admin-api';

/** Таблицы каталога, доступные для выгрузки и загрузки */
export const CATALOG_TABLE_KINDS = [
    'prices',
    'regions',
    'supplies',
    'complects',
] as const;

export type CatalogTableKind = (typeof CATALOG_TABLE_KINDS)[number];

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
            'Цены комплектов по видам поставок и цены пакетов услуг (ЛегалТех, СТАР).',
        fileName: 'garant-prices.xlsx',
        instructions: [
            'Листы «prof-regions» (регионы) и «prof-msk» (Москва): строка — комплект, колонка — вид поставки, в ячейке цена за месяц.',
            'Лист «services»: цены пакетов услуг, «msk» — Москва, «regions» — регионы.',
            'Меняйте только числа в ячейках. Коды в первой колонке и заголовки колонок не трогайте — по ним система находит, к чему относится цена.',
            'Чтобы оставить цену как есть — очистите ячейку: пустая ячейка значит «не менять».',
        ],
        warnings: [
            'Колонки «Локальная», «Флэш» и «Проксима 1 ОД» — это три разных вида поставки, а не повтор. У каждой своя цена.',
            'Консалтинга в этой таблице нет: у него не цена, а рабсы — правятся в карточке пакета.',
        ],
    },
    {
        kind: 'regions',
        title: 'Регионы',
        summary: 'Рабс региона — от него считается цена универсальной линейки.',
        fileName: 'garant-regions.xlsx',
        instructions: [
            'Колонка «abs» — рабс региона в рублях. Это основное, что меняется.',
            'Рабс с НДС система посчитает сама — такой колонки в файле нет специально, чтобы значения не разъехались.',
            'Новый регион — новая строка: заполните «code», «title» и «abs».',
        ],
    },
    {
        kind: 'supplies',
        title: 'Виды поставок',
        summary:
            'Число ОД, коэффициент цены и шаблоны текстов для договоров и предложений.',
        fileName: 'garant-supplies.xlsx',
        instructions: [
            'Колонка «coefficient» — множитель цены, «usersQuantity» — число одновременных доступов.',
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
            'Колонка «abs» — рабс. У универсальной линейки и консалтинга цена считается от него, а не берётся из таблицы цен.',
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
