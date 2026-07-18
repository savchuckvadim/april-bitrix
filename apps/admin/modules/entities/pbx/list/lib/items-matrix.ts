import type {
    BitrixListFieldItem,
    ListFieldRow,
    ListTemplateItem,
    PortalListFieldItem,
} from '../model';

/**
 * Одно значение enum-поля, смерженное с трёх сторон:
 * эталон (Excel-шаблон) × Bitrix (свойство инфоблока) × PortalDB (зеркало).
 */
export type ItemMatrixRow = {
    /** Стабильный code item-а (эталон/БД); null — item найден только в Bitrix. */
    code: string | null;
    template: ListTemplateItem | null;
    bitrix: BitrixListFieldItem | null;
    db: PortalListFieldItem | null;
    /** Отображаемые значения расходятся между источниками. */
    valueDrift: boolean;
    /** Item есть во всех трёх источниках и значения совпадают. */
    inSync: boolean;
};

const norm = (v: string) => v.trim().toLowerCase();

/** Значения присутствующих источников попарно совпадают. */
const sameValues = (values: (string | undefined)[]) => {
    const present = values.filter((v): v is string => v !== undefined);
    return present.every((v) => norm(v) === norm(present[0] as string));
};

/**
 * Смержить items поля по коду: БД матчится с эталоном по `code`, Bitrix — по
 * `bitrixId` из зеркала БД, остаток Bitrix — по совпадению значения с эталоном.
 * Непривязанные Bitrix-items попадают в конец с `code: null`.
 */
export function buildItemsMatrix(row: ListFieldRow): ItemMatrixRow[] {
    const dbItems = row.db?.items ?? [];
    const bxItems = row.bitrix?.items ?? [];

    const dbByCode = new Map(dbItems.map((item) => [item.code, item]));
    const bxById = new Map(bxItems.map((item) => [String(item.id), item]));
    const claimedDb = new Set<string>();
    const claimedBx = new Set<string>();

    const rows: ItemMatrixRow[] = [];

    const push = (
        code: string | null,
        template: ListTemplateItem | null,
        db: PortalListFieldItem | null,
        bitrix: BitrixListFieldItem | null,
    ) => {
        const drift = !sameValues([
            template?.value,
            bitrix?.value,
            db?.name,
        ]);
        rows.push({
            code,
            template,
            db,
            bitrix,
            valueDrift: drift,
            inSync: !!template && !!db && !!bitrix && !drift,
        });
    };

    for (const template of row.templateItems) {
        const db = dbByCode.get(template.code) ?? null;
        if (db) claimedDb.add(db.code);

        let bitrix = db ? (bxById.get(String(db.bitrixId)) ?? null) : null;
        if (!bitrix) {
            bitrix =
                bxItems.find(
                    (item) =>
                        !claimedBx.has(String(item.id)) &&
                        norm(item.value) === norm(template.value),
                ) ?? null;
        }
        if (bitrix) claimedBx.add(String(bitrix.id));

        push(template.code, template, db, bitrix);
    }

    for (const db of dbItems) {
        if (claimedDb.has(db.code)) continue;
        const bitrix = bxById.get(String(db.bitrixId)) ?? null;
        if (bitrix) claimedBx.add(String(bitrix.id));
        push(db.code, null, db, bitrix);
    }

    for (const bitrix of bxItems) {
        if (claimedBx.has(String(bitrix.id))) continue;
        push(null, null, null, bitrix);
    }

    return rows;
}
