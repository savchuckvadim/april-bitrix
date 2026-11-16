import { KNOWLEDGE_BUDGET_TEXT } from '../consts/knowledge-budget.texts';
import {
    KNOWLEDGE_USE_COMPLIANCE,
    type KnowledgeBudgetKind,
    type KnowledgeBudgetReport,
    type KnowledgeBudgetUse,
} from './types/knowledge-budget.types';

const T = KNOWLEDGE_BUDGET_TEXT;

/** Состояние вида: от него зависит цвет бейджа. */
export type KnowledgeBudgetStatus = 'empty' | 'fits' | 'cut' | 'unread';

export interface KnowledgeBudgetUseView {
    key: string;
    title: string;
    /** «помещается целиком, предел 6 000» и т.п. */
    line: string;
    /** «только: Презентация, Звонок по решению»; null — для всех типов. */
    types: string | null;
    cut: boolean;
    /** Место чтения выключено на портале — показано для справки. */
    off: boolean;
}

export interface KnowledgeBudgetRowView {
    kind: string;
    title: string;
    documents: string;
    volume: string | null;
    status: KnowledgeBudgetStatus;
    statusLabel: string;
    uses: KnowledgeBudgetUseView[];
}

export interface KnowledgeBudgetView {
    notes: string[];
    rows: KnowledgeBudgetRowView[];
}

const num = (value: number): string => value.toLocaleString('ru-RU');

function useLine(use: KnowledgeBudgetUse, chars: number): string {
    if (chars === 0) return T.useEmpty(num(use.budgetChars));
    return use.cutChars > 0
        ? T.useCut(num(use.fitChars), num(chars), num(use.cutChars))
        : T.useFits(num(use.budgetChars));
}

function toUseView(
    use: KnowledgeBudgetUse,
    chars: number,
    complianceOff: boolean,
): KnowledgeBudgetUseView {
    const off = complianceOff && use.use === KNOWLEDGE_USE_COMPLIANCE;
    return {
        key: `${use.use}:${use.budgetChars}:${use.callTypes?.join('|') ?? ''}`,
        title: use.title,
        line: useLine(use, chars),
        types: use.callTypes ? T.onlyTypes(use.callTypes.join(', ')) : null,
        cut: use.cutChars > 0 && !off,
        off,
    };
}

function statusOf(
    item: KnowledgeBudgetKind,
    uses: readonly KnowledgeBudgetUseView[],
): KnowledgeBudgetStatus {
    if (item.chars === 0) return 'empty';
    // Материалы есть, но все места чтения выключены на портале.
    if (uses.every((use) => use.off)) return 'unread';
    return uses.some((use) => use.cut) ? 'cut' : 'fits';
}

function statusLabel(
    status: KnowledgeBudgetStatus,
    item: KnowledgeBudgetKind,
    uses: readonly KnowledgeBudgetUseView[],
): string {
    if (status === 'empty') return T.statusEmpty;
    if (status === 'unread') return T.statusUnread;
    if (status === 'fits') return T.statusFits;
    // Наибольшая обрезка среди включённых мест чтения.
    const cut = Math.max(
        0,
        ...item.uses
            .filter((_, index) => uses[index]?.cut)
            .map((use) => use.cutChars),
    );
    return T.statusCut(num(cut));
}

function notesOf(report: KnowledgeBudgetReport): string[] {
    const notes: string[] = [];
    const methodology = report.methodology;
    if (!methodology) {
        notes.push(T.methodologyOff);
    } else {
        const text = methodology.declaresKnowledge
            ? T.methodologyOn
            : T.methodologyPlain;
        notes.push(text(methodology.title, methodology.version));
    }
    if (report.complianceEnabled === false) notes.push(T.complianceOffNote);
    if (report.complianceEnabled === null) notes.push(T.complianceUnknown);
    return notes;
}

/** Сводка бэкенда → строки таблицы и пояснения над ней. */
export function toKnowledgeBudgetView(
    report: KnowledgeBudgetReport,
): KnowledgeBudgetView {
    const complianceOff = report.complianceEnabled === false;
    return {
        notes: notesOf(report),
        rows: report.kinds.map((item) => {
            const uses = item.uses.map((use) =>
                toUseView(use, item.chars, complianceOff),
            );
            const status = statusOf(item, uses);
            return {
                kind: item.kind,
                title: item.title,
                documents: T.documents(item.documents),
                volume:
                    item.chars > 0
                        ? T.volumeLine(num(item.chars), num(item.tokens))
                        : null,
                status,
                statusLabel: statusLabel(status, item, uses),
                uses,
            };
        }),
    };
}
