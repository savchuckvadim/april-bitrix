import {
    KNOWLEDGE_LAYER_SHARED,
    type MethodologyAnchors,
    type MethodologyKnowledge,
} from '../model/methodology-materials';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** Якоря из конфига: чужая форма и пустые описания отбрасываются. */
export function anchorsOf(value: unknown): MethodologyAnchors {
    if (!isRecord(value)) return {};
    const anchors: MethodologyAnchors = {};
    for (const [section, bands] of Object.entries(value)) {
        if (!isRecord(bands)) continue;
        const texts: Record<string, string> = {};
        for (const [band, text] of Object.entries(bands)) {
            if (typeof text === 'string' && text !== '') texts[band] = text;
        }
        if (Object.keys(texts).length > 0) anchors[section] = texts;
    }
    return anchors;
}

/**
 * Описание полосы раздела; пустой текст убирает полосу, раздел без полос
 * убирается целиком. Якорей не осталось — undefined: поля в конфиге нет, и
 * валидатор не ругается на пустые описания.
 */
export function setAnchor(
    anchors: MethodologyAnchors,
    section: string,
    band: string,
    text: string,
): MethodologyAnchors | undefined {
    const bands = { ...(anchors[section] ?? {}) };
    if (text === '') delete bands[band];
    else bands[band] = text;

    const next: MethodologyAnchors = { ...anchors };
    if (Object.keys(bands).length > 0) next[section] = bands;
    else delete next[section];
    return Object.keys(next).length > 0 ? next : undefined;
}

/** Описания без пробелов по краям — на потерю фокуса; пустые полосы уходят. */
export function trimAnchors(
    anchors: MethodologyAnchors,
): MethodologyAnchors | undefined {
    const next: MethodologyAnchors = {};
    for (const [section, bands] of Object.entries(anchors)) {
        const texts: Record<string, string> = {};
        for (const [band, text] of Object.entries(bands)) {
            if (text.trim() !== '') texts[band] = text.trim();
        }
        if (Object.keys(texts).length > 0) next[section] = texts;
    }
    return Object.keys(next).length > 0 ? next : undefined;
}

/** Сколько полос заполнено у раздела. */
export const filledBands = (
    anchors: MethodologyAnchors,
    section: string,
): number => Object.keys(anchors[section] ?? {}).length;

/** Материалы из конфига: чужая форма и нестроковые слои отбрасываются. */
export function knowledgeOf(value: unknown): MethodologyKnowledge {
    if (!isRecord(value)) return {};
    const knowledge: MethodologyKnowledge = {};
    for (const [kind, layer] of Object.entries(value)) {
        if (typeof layer === 'string' && layer !== '') knowledge[kind] = layer;
    }
    return knowledge;
}

/**
 * Включить или выключить вид для прохода методики. Новый вид получает слой
 * «общий документ». Ничего не отмечено — undefined: поля в конфиге нет.
 */
export function toggleKnowledge(
    knowledge: MethodologyKnowledge,
    kind: string,
    enabled: boolean,
): MethodologyKnowledge | undefined {
    const next = { ...knowledge };
    if (enabled) next[kind] = next[kind] ?? KNOWLEDGE_LAYER_SHARED;
    else delete next[kind];
    return Object.keys(next).length > 0 ? next : undefined;
}

/**
 * Чей документ: общий (`shared`) или этой методики (её код). У методики без
 * кода «свой» слой задать нельзя — остаётся общий.
 */
export function setKnowledgeLayer(
    knowledge: MethodologyKnowledge,
    kind: string,
    own: boolean,
    methodologyCode: string,
): MethodologyKnowledge {
    return {
        ...knowledge,
        [kind]: own && methodologyCode ? methodologyCode : KNOWLEDGE_LAYER_SHARED,
    };
}

/** Вид отмечен как документ этой методики (любой слой, кроме общего). */
export const isOwnLayer = (knowledge: MethodologyKnowledge, kind: string): boolean =>
    knowledge[kind] !== undefined && knowledge[kind] !== KNOWLEDGE_LAYER_SHARED;
