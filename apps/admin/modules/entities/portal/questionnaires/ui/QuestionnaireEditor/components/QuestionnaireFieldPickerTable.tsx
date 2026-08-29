'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireFieldRow } from '../../../lib/field-picker-view';
import { QuestionnaireFieldPickerRow } from './QuestionnaireFieldPickerRow';

interface QuestionnaireFieldPickerTableProps {
    rows: QuestionnaireFieldRow[];
    /** UF-имена отмеченных полей. */
    selected: string[];
    onToggle: (fieldName: string) => void;
}

/**
 * Таблица живых UF-полей носителя.
 *
 * Колонки показывают ровно то, по чему владелец узнаёт своё поле: UF-имя
 * (им поле адресуется во фрейме), название из Битрикса, тип, множественность
 * и символьный код. Множественность вынесена колонкой не для красоты:
 * массивы фрейм не пишет, и такое поле взять нельзя.
 */
export const QuestionnaireFieldPickerTable = ({
    rows,
    selected,
    onToggle,
}: QuestionnaireFieldPickerTableProps) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-10" />
                <TableHead>
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerColumnField}
                </TableHead>
                <TableHead>
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerColumnTitle}
                </TableHead>
                <TableHead>
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerColumnType}
                </TableHead>
                <TableHead>
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerColumnMultiple}
                </TableHead>
                <TableHead>
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerColumnXmlId}
                </TableHead>
                <TableHead>
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerColumnMarks}
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {rows.map(row => (
                <QuestionnaireFieldPickerRow
                    key={row.field.fieldName}
                    row={row}
                    isSelected={selected.includes(row.field.fieldName)}
                    onToggle={() => onToggle(row.field.fieldName)}
                />
            ))}
        </TableBody>
    </Table>
);
