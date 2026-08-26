/**
 * «Звонки По решению» (ЗПР) — элементы смарт-процесса `zpr_sales`.
 *
 * Бэкенда-посредника у сущности нет: элементы создаёт/закрывает сайд-очередь
 * бэка ПОСЛЕ основного отчёта, а фронт читает их напрямую из Битрикса по
 * обратным ссылкам `T{hex(entityTypeId)}_{elementId}` в pbx-поле `op_zprs`
 * сделки и компании. Шаблон полей смарта — бэк-реестр
 * back/libs/portal-lib/pbx/pbx-zpr-smart (коды ZPR_*).
 */

/** Разобранная ссылка op_zprs на элемент динамического типа. */
export interface ZprRef {
    /** entityTypeId динамического типа (из hex-части `T40e` → 1038). */
    entityTypeId: number;
    elementId: number;
}

/** Ступень словаря стадий ЗПР (crm.status.list динамического типа). */
export interface ZprStageDictItem {
    /** STATUS_ID вида `DT{entityTypeId}_{categoryId}:{CODE}`. */
    statusId: string;
    name: string;
    /** Цвет стадии из настроек воронки (#rrggbb); нет — undefined. */
    color?: string;
    /** Семантика Битрикса: P — в работе, S — успех, F — провал. */
    semantics: 'P' | 'S' | 'F' | null;
}

/** Словарь стадий воронки ЗПР: полный и «лестница» без стадий-провалов. */
export interface ZprStageDict {
    /** Все стадии в порядке SORT — для имён и семантики закрытых. */
    all: ZprStageDictItem[];
    /**
     * Лестница пути без провалов (как buildStageDict у сделок): по ней
     * рисуется градиент-полоска; успех остаётся финалом шкалы.
     */
    ladder: ZprStageDictItem[];
}

/** Элемент смарта ЗПР в доменном виде (из camel-ключей crm.item). */
export interface ZprCall {
    id: number;
    entityTypeId: number;
    categoryId: number;
    title: string;
    stageId: string;
    /** Запланирован на (ZPR_PLAN_DATE, ISO из crm.item). */
    planDate: string | null;
    /** Состоялся (ZPR_DONE_DATE, ISO). */
    doneDate: string | null;
    isSpontaneous: boolean;
    planComment: string | null;
    reportComment: string | null;
    /** Накопительная лента комментариев (ZPR_COMMENTS, свежие первыми). */
    comments: string[];
}

/** ЗПР + разрезка по словарю стадий — то, что рисует UI. */
export interface ZprCallView {
    call: ZprCall;
    /** Имя текущей стадии (по полному словарю); нет словаря — null. */
    stageName: string | null;
    /** Семантика текущей стадии; нет словаря — null. */
    semantics: 'P' | 'S' | 'F' | null;
    /** Закрыт (стадия с семантикой S/F). */
    isClosed: boolean;
}
