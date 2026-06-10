export interface IBXStatus {
    ENTITY_ID: 'STATUS' | "DEAL_STAGE" | string;
    CATEGORY_ID: number | string | null;
    STATUS_ID: "APOLOGY" | string
    NAME: "Анализ причины провала",
    NAME_INIT: "",
    SORT: number | string;
    SYSTEM: "N" | "Y",
    COLOR: string;
    SEMANTICS: "F" | "S" | null,
    EXTRA: {
        "SEMANTICS": "apology",
        "COLOR": "#FF5752"
    }
}
