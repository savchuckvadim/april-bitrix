import { HowContentBlock } from '../../how-we-work/constants/types';

/** Роль-актор шага процесса (цветовое кодирование как в легенде). */
export type LeadsFlowActor = 'sys' | 'mgr' | 'rop';

/** Смысловой тон узла-события. */
export type LeadsFlowTone = 'start' | 'done' | 'junk' | 'warn';

/** Данные узла схемы. */
export interface LeadsFlowNodeData {
    label: string;
    /** Вторая строка — подробность */
    sub?: string;
    actor?: LeadsFlowActor;
    tone?: LeadsFlowTone;
    /** Горизонтальная схема: хэндлы слева/справа вместо сверху/снизу */
    horizontal?: boolean;
    [key: string]: unknown;
}

/** Узел схемы (координаты — вручную, легко редактировать). */
export interface LeadsFlowNodeDef {
    id: string;
    kind: 'task' | 'gateway' | 'event';
    position: { x: number; y: number };
    data: LeadsFlowNodeData;
}

/** Ребро схемы. */
export interface LeadsFlowEdgeDef {
    source: string;
    target: string;
    label?: string;
    /** Пунктир — редкий/исключительный путь */
    dashed?: boolean;
}

/** Схема целиком. */
export interface LeadsFlowDef {
    id: string;
    /** Высота канваса, px */
    height: number;
    nodes: LeadsFlowNodeDef[];
    edges: LeadsFlowEdgeDef[];
    caption?: string;
}

/** Колонка канбана фаз (в стиле стадий Битрикс24). */
export interface LeadsKanbanColumn {
    title: string;
    actor: string;
    /** Токен-класс цвета верхней полосы колонки */
    accentClass: string;
    items: string[];
}

/** Блок секции: контент-блоки раздела «Как мы работаем» + свои типы. */
export type LeadsSectionBlock =
    | HowContentBlock
    | { type: 'flow'; flowId: string }
    | { type: 'kanban'; columns: LeadsKanbanColumn[] }
    | { type: 'legend' };

/** Секция страницы (пункт левого меню). */
export interface LeadsSection {
    id: string;
    /** Название в sidebar */
    navLabel: string;
    title: string;
    eyebrow?: string;
    blocks: LeadsSectionBlock[];
}
