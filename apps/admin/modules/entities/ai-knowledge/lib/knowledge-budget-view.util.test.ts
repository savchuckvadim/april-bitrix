import { describe, expect, it } from 'vitest';
import type {
    KnowledgeBudgetKind,
    KnowledgeBudgetReport,
    KnowledgeBudgetUse,
} from './types/knowledge-budget.types';
import { toKnowledgeBudgetView } from './knowledge-budget-view.util';

/** toLocaleString('ru-RU') ставит неразрывные пробелы — в тестах обычные. */
const plain = (text: string): string => text.replace(/\s/g, ' ');

const use = (fields: Partial<KnowledgeBudgetUse> = {}): KnowledgeBudgetUse => ({
    use: 'focus-shared',
    title: 'Разбор звонка: все проходы и итог',
    budgetChars: 6000,
    fitChars: 6000,
    cutChars: 0,
    callTypes: null,
    ...fields,
});

const kind = (
    fields: Partial<KnowledgeBudgetKind> = {},
): KnowledgeBudgetKind => ({
    kind: 'sales-script',
    title: 'Скрипт разговора',
    documents: 1,
    chars: 4200,
    tokens: 1400,
    uses: [use({ fitChars: 4200 })],
    cutChars: 0,
    ...fields,
});

const report = (
    fields: Partial<KnowledgeBudgetReport> = {},
): KnowledgeBudgetReport => ({
    domain: 'gsr.bitrix24.ru',
    charsPerToken: 3,
    methodology: null,
    complianceEnabled: true,
    kinds: [kind()],
    ...fields,
});

describe('toKnowledgeBudgetView', () => {
    it('вид помещается: объём с оценкой токенов, статус «помещается»', () => {
        const [row] = toKnowledgeBudgetView(report()).rows;

        expect(row?.status).toBe('fits');
        expect(row?.statusLabel).toBe('помещается');
        expect(plain(row?.volume ?? '')).toBe('4 200 зн. · ≈ 1 400 токенов');
        expect(plain(row?.uses[0]?.line ?? '')).toBe(
            'помещается целиком, предел 6 000',
        );
        expect(row?.uses[0]?.types).toBeNull();
    });

    it('вид обрезается: видно, сколько помещается и сколько обрезано, с типами звонков', () => {
        const [row] = toKnowledgeBudgetView(
            report({
                kinds: [
                    kind({
                        kind: 'presentation-playbook',
                        chars: 7840,
                        tokens: 2614,
                        cutChars: 1840,
                        uses: [
                            use({
                                cutChars: 1840,
                                callTypes: ['Презентация', 'Звонок по решению'],
                            }),
                        ],
                    }),
                ],
            }),
        ).rows;

        expect(row?.status).toBe('cut');
        expect(plain(row?.statusLabel ?? '')).toBe('обрезается 1 840');
        expect(plain(row?.uses[0]?.line ?? '')).toBe(
            'помещается 6 000 из 7 840, обрезано 1 840',
        );
        expect(row?.uses[0]?.types).toBe(
            'только: Презентация, Звонок по решению',
        );
    });

    it('пустой вид: материалов нет, показан только предел', () => {
        const [row] = toKnowledgeBudgetView(
            report({
                kinds: [kind({ documents: 0, chars: 0, tokens: 0 })],
            }),
        ).rows;

        expect(row?.status).toBe('empty');
        expect(row?.volume).toBeNull();
        expect(row?.documents).toBe('документов: 0');
        expect(plain(row?.uses[0]?.line ?? '')).toBe('предел 6 000');
    });

    it('проверка по регламенту выключена: её обрезка не считается, вид только с ней — «никем не читается»', () => {
        const compliance = use({
            use: 'compliance',
            title: 'Проверка по регламенту',
            cutChars: 1500,
        });
        const view = toKnowledgeBudgetView(
            report({
                complianceEnabled: false,
                kinds: [
                    kind({
                        kind: 'product-facts',
                        chars: 7500,
                        cutChars: 1500,
                        uses: [compliance],
                    }),
                    kind({
                        chars: 7500,
                        cutChars: 1500,
                        uses: [
                            use({ budgetChars: 8000, fitChars: 7500 }),
                            compliance,
                        ],
                    }),
                ],
            }),
        );

        expect(view.rows[0]?.status).toBe('unread');
        expect(view.rows[0]?.uses[0]).toMatchObject({ off: true, cut: false });
        // Скрипт читает и разбор — там он помещается.
        expect(view.rows[1]?.status).toBe('fits');
        expect(view.notes).toContain(
            'Проверка по регламенту на портале выключена — её строки показаны для справки.',
        );
    });

    it('пояснения: методика выбрана и объявила материалы, не объявила, не выбрана', () => {
        const methodology = {
            title: 'Полянский',
            version: '1.2',
            declaresKnowledge: true,
        };

        // Старый бэк не присылает имя для людей — по названию, как раньше.
        expect(toKnowledgeBudgetView(report({ methodology })).notes[0]).toBe(
            'Методика «Полянский» (1.2): её проход получает материалы, которые методика объявила своими.',
        );
        expect(
            toKnowledgeBudgetView(
                report({
                    methodology: {
                        ...methodology,
                        displayTitle: 'Методика Полянского',
                    },
                }),
            ).notes[0],
        ).toBe(
            'Методика Полянского (1.2): её проход получает материалы, которые методика объявила своими.',
        );
        expect(
            toKnowledgeBudgetView(
                report({
                    methodology: { ...methodology, declaresKnowledge: false },
                }),
            ).notes[0],
        ).toContain('своих материалов не объявила');
        expect(toKnowledgeBudgetView(report()).notes[0]).toContain(
            'Методика продаж на портале не выбрана',
        );
        expect(
            toKnowledgeBudgetView(report({ complianceEnabled: null })).notes,
        ).toContain(
            'Не удалось прочитать, включена ли на портале проверка по регламенту.',
        );
    });
});
