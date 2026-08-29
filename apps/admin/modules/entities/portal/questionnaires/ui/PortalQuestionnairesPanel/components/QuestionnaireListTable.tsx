'use client';

import { Badge } from '@workspace/ui/components/badge';
import { DataTable } from '@/modules/shared/ui';
import type { Column } from '@/modules/shared/ui';
import { QUESTIONNAIRES_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireCheckSummary } from '../../../lib/check-result-view';
import type { QuestionnaireRow } from '../../../lib/questionnaire-list-view';
import { QuestionnaireActiveSwitch } from './QuestionnaireActiveSwitch';
import { QuestionnaireConditionsCell } from './QuestionnaireConditionsCell';
import { QuestionnaireIssuesCell } from './QuestionnaireIssuesCell';
import { QuestionnaireRowActions } from './QuestionnaireRowActions';

interface QuestionnaireListTableProps {
    portalId: number;
    rows: QuestionnaireRow[];
    isLoading: boolean;
    /** Какая анкета сейчас пересохраняется переключателем. */
    togglingId: string | null;
    onToggle: (row: QuestionnaireRow) => void;
    /** Какая анкета сейчас сверяет привязки. */
    checkingId: string | null;
    checkSummaries: Record<string, QuestionnaireCheckSummary>;
    onCheck: (row: QuestionnaireRow) => void;
    onRemove: (row: QuestionnaireRow) => void;
}

/**
 * Плоский список анкет — второй вид каталога.
 *
 * Матрица отвечает на вопрос «что спросят на этом типе события», но
 * умалчивает о том, чем анкета адресуется и когда её последний раз
 * трогали: код, приложение, дата обновления и действия над строкой
 * (переключить, сверить привязки, удалить) живут только здесь.
 *
 * Подписи назначений и условий приходят из реестра `GET /schema` — админка
 * не хардкодит ни одного кода.
 */
export const QuestionnaireListTable = ({
    portalId,
    rows,
    isLoading,
    togglingId,
    onToggle,
    checkingId,
    checkSummaries,
    onCheck,
    onRemove,
}: QuestionnaireListTableProps) => {
    const columns: Column<QuestionnaireRow>[] = [
        {
            id: 'code',
            header: QUESTIONNAIRES_TEXT.columnCode,
            cell: row => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs">{row.code}</span>
                    <span className="text-muted-foreground text-xs">
                        {row.appCode}
                    </span>
                </div>
            ),
        },
        {
            id: 'title',
            header: QUESTIONNAIRES_TEXT.columnTitle,
            accessorKey: 'title',
        },
        {
            id: 'purpose',
            header: QUESTIONNAIRES_TEXT.columnPurpose,
            cell: row => <Badge variant="secondary">{row.purposeLabel}</Badge>,
        },
        {
            id: 'place',
            header: QUESTIONNAIRES_TEXT.columnPlace,
            cell: row => <span className="text-sm">{row.placeLabel}</span>,
        },
        {
            id: 'items',
            header: QUESTIONNAIRES_TEXT.columnItems,
            cell: row => <span className="text-sm">{row.itemsCount}</span>,
        },
        {
            id: 'conditions',
            header: QUESTIONNAIRES_TEXT.columnConditions,
            cell: row => <QuestionnaireConditionsCell row={row} />,
        },
        {
            id: 'active',
            header: QUESTIONNAIRES_TEXT.columnActive,
            cell: row => (
                <QuestionnaireActiveSwitch
                    row={row}
                    isBusy={togglingId === row.id}
                    onToggle={onToggle}
                />
            ),
        },
        {
            id: 'issues',
            header: QUESTIONNAIRES_TEXT.columnIssues,
            cell: row => <QuestionnaireIssuesCell row={row} />,
        },
        {
            id: 'updated',
            header: QUESTIONNAIRES_TEXT.columnUpdated,
            cell: row => (
                <span className="text-muted-foreground text-xs">
                    {row.updatedLabel}
                </span>
            ),
        },
        {
            id: 'actions',
            header: QUESTIONNAIRES_TEXT.columnActions,
            className: 'text-right',
            cell: row => (
                <QuestionnaireRowActions
                    row={row}
                    portalId={portalId}
                    isChecking={checkingId === row.id}
                    checkSummary={checkSummaries[row.id]}
                    onCheck={onCheck}
                    onRemove={onRemove}
                />
            ),
        },
    ];

    return (
        <DataTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            emptyMessage={QUESTIONNAIRES_TEXT.empty}
        />
    );
};
