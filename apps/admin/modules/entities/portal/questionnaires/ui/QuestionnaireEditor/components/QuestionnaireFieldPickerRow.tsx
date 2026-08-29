'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import { describeFieldUsage } from '../../../lib/field-picker-view';
import type { QuestionnaireFieldRow } from '../../../lib/field-picker-view';

interface QuestionnaireFieldPickerRowProps {
    row: QuestionnaireFieldRow;
    isSelected: boolean;
    onToggle: () => void;
}

/**
 * Одно поле в таблице пикера.
 *
 * Непригодное поле не прячется, а показывается с причиной: владелец, сам
 * заведший это поле в CRM, иначе решил бы, что админка его потеряла. Взять
 * такое поле нельзя — вопрос из него бэк отклонил бы на сохранении.
 *
 * Метка «Заведено вручную» — главная в этой таблице: анкету собирают
 * ровно из полей, которых нет ни в одном слепке установщика.
 */
export const QuestionnaireFieldPickerRow = ({
    row,
    isSelected,
    onToggle,
}: QuestionnaireFieldPickerRowProps) => {
    const { field, rejectReason } = row;
    const isBlocked = !!rejectReason;
    const usage = describeFieldUsage(row.usedIn);

    return (
        <TableRow
            className={cn(
                isBlocked && 'opacity-60',
                isSelected && !isBlocked && 'bg-primary/5',
            )}
        >
            <TableCell className="align-top">
                <Checkbox
                    checked={isSelected}
                    disabled={isBlocked}
                    aria-label={field.fieldName}
                    onCheckedChange={onToggle}
                />
            </TableCell>

            <TableCell className="align-top">
                <code className="text-xs">{field.fieldName}</code>
            </TableCell>

            <TableCell className="align-top">
                <div className="space-y-1">
                    <span className="text-sm">
                        {field.title || field.fieldName}
                    </span>
                    {rejectReason && (
                        <p className="text-xs text-destructive">
                            {rejectReason}
                        </p>
                    )}
                    {usage && (
                        <p className="text-xs text-muted-foreground">{usage}</p>
                    )}
                </div>
            </TableCell>

            <TableCell className="align-top">
                <Badge variant="secondary">{field.type}</Badge>
            </TableCell>

            <TableCell className="align-top">
                {/* Множественное поле запрещено: ответ записался бы в
                    первый элемент и исчез — показываем это колонкой, а не
                    только причиной в строке. */}
                {field.multiple ? (
                    <Badge variant="destructive">
                        {QUESTIONNAIRE_EDITOR_TEXT.pickerYes}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.pickerNo}
                    </span>
                )}
            </TableCell>

            <TableCell className="align-top">
                {field.xmlId ? (
                    <code className="text-xs">{field.xmlId}</code>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.pickerNoValue}
                    </span>
                )}
            </TableCell>

            <TableCell className="align-top">
                <div className="flex flex-wrap gap-1">
                    <Badge variant={row.isManual ? 'default' : 'outline'}>
                        {row.isManual
                            ? QUESTIONNAIRE_EDITOR_TEXT.pickerManual
                            : QUESTIONNAIRE_EDITOR_TEXT.pickerInstalled}
                    </Badge>
                    {row.usedCount > 0 && (
                        <Badge variant="outline">
                            {QUESTIONNAIRE_EDITOR_TEXT.pickerUsed}:{' '}
                            {row.usedCount}
                        </Badge>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
};
