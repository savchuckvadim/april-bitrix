/**
 * Формат легаси-слепка (v1) — запись таблицы bx_document_deals,
 * которую писал старый конструктор (remember-reducer.js).
 * Каждое содержательное поле — JSON-СТРОКА. Все поля могут отсутствовать
 * в старых записях. См. docs/legacy-persistence.md.
 */

export interface V1Record {
    dealId?: number;
    userId?: number;
    domain?: string;
    serviceSmartId?: number | null;
    templateId?: number | null;
    app?: string | null;
    global?: string | null;
    currentComplect?: string | null;
    od?: string | null;
    result?: string | null;
    contract?: string | null;
    dealName?: string | null;
    product?: string | null;
    rows?: string | null;
    regions?: string | null;
    iskraConfig?: string | null;
    ltOther?: string | null;
}

/** Разобранный currentComplect (легаси ComplectType, номерная адресация) */
export interface V1CurrentComplect {
    number: number;
    type: 'prof' | 'universal';
    name?: string;
    filling?: string[];
    ers?: number[];
    packetsEr?: number[];
    ersInPacket?: number[];
    lt?: number[];
    ltInPacket?: number[];
    freeBlocks?: number[];
    consalting?: number[];
    consaltingProduct?: number[];
    star?: number[];
    academy?: number[];
}

export interface V1Region {
    number: number;
    name: string;
    title?: string;
    abs?: number;
}

export interface V1Row {
    id: number | false;
    setId?: number;
    number?: number; // счётчик генерации — ИГНОРИРОВАТЬ
    name: string;
    shortName?: string;
    alternativeName?: string;
    type?: 'general' | 'alternative';
    productType: 'garant' | 'lt' | 'lt_other' | 'consalting' | 'star' | 'academy';
    complect?: { type?: string; number: number };
    supply?: { number: number; name?: string; type?: string };
    contract?: { number: number; name?: string; code?: string };
    /** Полная копия справочного продукта; используем только monthQuantity академии */
    product?: { monthQuantity?: number | null } | null;
    price?: {
        default: number;
        current: number;
        quantity?: number;
        month?: number;
        sum?: number;
        measure?: {
            id?: number;
            code?: number;
            type?: number;
            name?: string;
        };
        discount?: {
            precent?: number;
            amount?: number;
            current?: 'precent' | 'amount';
        };
    };
}

export interface V1RowSet {
    id: number;
    show?: boolean;
    rows: Partial<
        Record<
            'garant' | 'lt' | 'lt_other' | 'consalting' | 'star' | 'academy',
            V1Row[]
        >
    >;
    total?: V1Row[];
}

export interface V1Rows {
    show?: 'rows' | 'set';
    sets?: { general?: V1RowSet[]; alternative?: V1RowSet[] };
}

export interface V1Parsed {
    dealId: number | null;
    domain: string | null;
    currentComplect: V1CurrentComplect | null;
    odNumber: number | null;
    contract: { number: number; shortName?: string; code?: string } | null;
    rows: V1Rows | null;
    regions: {
        inComplect?: V1Region[];
        favorite?: V1Region[];
        noWidth?: V1Region[];
    } | null;
    globalRegion: V1Region | null;
    templateId: number | null;
    /** Поля, которые не удалось разобрать */
    parseErrors: string[];
}
