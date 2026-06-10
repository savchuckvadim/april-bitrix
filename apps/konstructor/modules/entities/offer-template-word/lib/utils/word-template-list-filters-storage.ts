
import { getLocalStorageJson, setLocalStorageJson } from "@workspace/api";
import { WordTemplateVisibility } from "../../types/word-template-types";

export const WORD_TEMPLATE_LIST_FILTERS_STORAGE_KEY = "wordTemplateListFilters";
const PREFIX = "konstructor:word-template-list-filters:";
export interface WordTemplateListFiltersState {
    visibility?: WordTemplateVisibility;
    isActive?: boolean;
    showFavorites?: boolean;
}

type PersistedFilters = {
    visibility?: string;
    isActive?: boolean;
    showFavorites?: boolean;
};

const VISIBILITY_VALUES = new Set<string>(Object.values(WordTemplateVisibility));

function normalizeVisibility(raw: unknown): WordTemplateVisibility | undefined {
    if (typeof raw !== "string" || !VISIBILITY_VALUES.has(raw)) {
        return undefined;
    }
    return raw as WordTemplateVisibility;
}

export function loadWordTemplateListFilters(isSuperUser: boolean): WordTemplateListFiltersState {
    const raw = getLocalStorageJson<PersistedFilters>(WORD_TEMPLATE_LIST_FILTERS_STORAGE_KEY);
    if (!raw || typeof raw !== "object") {
        return {};
    }

    const result: WordTemplateListFiltersState = {};

    const visibility = normalizeVisibility(raw.visibility);
    if (visibility !== undefined) {
        if (visibility === WordTemplateVisibility.PUBLIC && !isSuperUser) {
            // сохранённый фильтр недоступен для роли
        } else {
            result.visibility = visibility;
        }
    }

    if (raw.showFavorites === true) {
        result.showFavorites = true;
    }

    if (raw.isActive === true || raw.isActive === false) {
        result.isActive = raw.isActive;
    }

    return result;
}

export function persistWordTemplateListFilters(filters: WordTemplateListFiltersState): void {
    const payload: PersistedFilters = {};
    if (filters.visibility !== undefined) {
        payload.visibility = filters.visibility;
    }
    if (filters.isActive === true || filters.isActive === false) {
        payload.isActive = filters.isActive;
    }
    if (filters.showFavorites === true) {
        payload.showFavorites = true;
    }
    setLocalStorageJson(WORD_TEMPLATE_LIST_FILTERS_STORAGE_KEY, payload, PREFIX);
}
