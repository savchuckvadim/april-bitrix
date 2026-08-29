'use client';

import { Fragment } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_MATRIX_TEXT,
    QUESTIONNAIRE_PURPOSE_COLUMN_TEXT,
} from '../../../consts/questionnaires.const';
import type { QuestionnaireMatrix } from '../../../lib/questionnaire-matrix';
import { QuestionnaireLooseBlock } from './QuestionnaireLooseBlock';
import { QuestionnaireMatrixCell } from './QuestionnaireMatrixCell';
import { QuestionnaireMatrixRowHead } from './QuestionnaireMatrixRowHead';

interface QuestionnaireMatrixViewProps {
    portalId: number;
    matrix: QuestionnaireMatrix;
    isLoading: boolean;
    /** Настройки портала прочитаны — выключателем есть чем управлять. */
    isSwitchReady: boolean;
    isSwitchSaving: boolean;
    onToggleEventType: (eventType: string, isDisabled: boolean) => void;
}

/**
 * Каталог анкет в разрезе по типам событий.
 *
 * Строки — типы событий из реестра `GET /schema`, сгруппированные по виду
 * условия (планирование и отчёт); колонки — назначение анкеты. Ни одного
 * кода типа события админка не знает: и подписи, и порядок лестницы
 * приходят с бэка, поэтому новый тип события появляется здесь сам собой.
 *
 * Рядом с матрицей — всё, что в неё не легло: анкеты без условия по типу
 * события и анкеты, состав которых ещё едет. Пустой матрица выглядит
 * только тогда, когда у портала действительно ничего не спрашивают.
 */
export const QuestionnaireMatrixView = ({
    portalId,
    matrix,
    isLoading,
    isSwitchReady,
    isSwitchSaving,
    onToggleEventType,
}: QuestionnaireMatrixViewProps) => {
    if (isLoading) {
        return (
            <p className="text-muted-foreground text-sm">
                {QUESTIONNAIRES_TEXT.loading}
            </p>
        );
    }

    // Реестр не прочитан либо в нём нет ни одного типа события: строить
    // разрез не по чему. Анкеты при этом не теряются — они ниже.
    const hasGrid = matrix.columns.length > 0 && matrix.groups.length > 0;

    return (
        <div className="flex flex-col gap-6">
            {hasGrid ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-56 align-bottom">
                                    {QUESTIONNAIRE_MATRIX_TEXT.columnEventType}
                                </TableHead>
                                {matrix.columns.map(column => (
                                    <TableHead
                                        key={column.purpose}
                                        title={column.description}
                                        className="h-auto py-2 align-bottom whitespace-normal"
                                    >
                                        <span className="block">
                                            {
                                                QUESTIONNAIRE_PURPOSE_COLUMN_TEXT[
                                                    column.purpose
                                                ]
                                            }
                                        </span>
                                        {/* Название назначения из реестра:
                                            колонка и назначение анкеты —
                                            одно и то же, и это видно. */}
                                        <span className="text-muted-foreground block text-xs font-normal">
                                            {column.label}
                                        </span>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {matrix.groups.map(group => (
                                <Fragment key={group.kind}>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableCell
                                            colSpan={matrix.columns.length + 1}
                                            className="py-1.5 whitespace-normal"
                                        >
                                            <span
                                                className="text-xs font-semibold"
                                                title={group.description}
                                            >
                                                {group.title}
                                            </span>
                                        </TableCell>
                                    </TableRow>

                                    {group.rows.map(row => (
                                        <TableRow
                                            key={`${group.kind}:${row.code}`}
                                            className={
                                                row.isDisabled
                                                    ? 'align-top opacity-60'
                                                    : 'align-top'
                                            }
                                        >
                                            <TableCell
                                                className="whitespace-normal"
                                                title={row.description}
                                            >
                                                <QuestionnaireMatrixRowHead
                                                    row={row}
                                                    isSwitchReady={
                                                        isSwitchReady
                                                    }
                                                    isSwitchSaving={
                                                        isSwitchSaving
                                                    }
                                                    onToggle={onToggleEventType}
                                                />
                                            </TableCell>
                                            {row.cells.map(cell => (
                                                <TableCell
                                                    key={cell.purpose}
                                                    className="whitespace-normal"
                                                >
                                                    <QuestionnaireMatrixCell
                                                        portalId={portalId}
                                                        cell={cell}
                                                    />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">
                    {QUESTIONNAIRE_MATRIX_TEXT.empty}
                </p>
            )}

            {matrix.loose.length > 0 && (
                <QuestionnaireLooseBlock
                    portalId={portalId}
                    cards={matrix.loose}
                />
            )}

            {/* Состав анкеты приезжает отдельным запросом, а место в матрице
                решают именно условия из него: пока он идёт, анкета честно
                висит вне разреза, а не подставляется в случайную строку. */}
            {matrix.pending.length > 0 && (
                <p className="text-muted-foreground text-xs">
                    {QUESTIONNAIRE_MATRIX_TEXT.pendingTitle}:{' '}
                    {matrix.pending.map(card => card.title).join(', ')}.{' '}
                    {QUESTIONNAIRE_MATRIX_TEXT.pendingHint}
                </p>
            )}
        </div>
    );
};
