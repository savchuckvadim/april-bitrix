'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    IconAction,
    MicroSelect,
    type MicroSelectOption,
} from '@workspace/april-ui';
import {
    AI_ABSENCE_HORIZON_DAYS,
    AI_ABSENCE_KIND_OPTIONS,
    isAiAbsenceKind,
} from '@/modules/entities/ai-analytics';
import type { AiAbsenceFormRow } from '../../lib/ai-settings-form.util';

interface AiSettingsAbsencesTabProps {
    rows: AiAbsenceFormRow[];
    errors: Map<number, string>;
    /** Менеджеры обзора — значения селекта (Bitrix-id строкой). */
    managers: MicroSelectOption[];
    disabled: boolean;
    onAdd: () => void;
    onChange: (
        id: number,
        changes: Partial<Omit<AiAbsenceFormRow, 'id'>>,
    ) => void;
    onRemove: (id: number) => void;
}

const DATE_INPUT_CLASS = 'h-7 max-w-36 text-xs';

/** Вкладка «Отсутствия»: менеджер, период с/по, вид; добавить/удалить. */
export const AiSettingsAbsencesTab = ({
    rows,
    errors,
    managers,
    disabled,
    onAdd,
    onChange,
    onRemove,
}: AiSettingsAbsencesTabProps) => (
    <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
            Отпуск, больничный или обучение снимают ожидания с менеджера на эти
            дни. Список — текущие отсутствия портала; сохранение заменяет его
            тем, что здесь: удалённая строка снимает отсутствие. Не дальше{' '}
            {AI_ABSENCE_HORIZON_DAYS} дней вперёд, без пересечений у одного
            менеджера.
        </p>
        {rows.length > 0 && (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Менеджер</TableHead>
                        <TableHead>С</TableHead>
                        <TableHead>По</TableHead>
                        <TableHead>Вид</TableHead>
                        <TableHead className="w-8" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => {
                        const error = errors.get(row.id);
                        return (
                            <TableRow key={row.id}>
                                <TableCell className="align-top">
                                    <MicroSelect
                                        ariaLabel="Менеджер"
                                        value={row.managerId || undefined}
                                        options={managers}
                                        placeholder="Выберите"
                                        disabled={disabled}
                                        invalid={!!error && !row.managerId}
                                        onChange={managerId =>
                                            onChange(row.id, { managerId })
                                        }
                                    />
                                    {error && (
                                        <p className="mt-1 text-[0.6875rem] text-destructive">
                                            {error}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell className="align-top">
                                    <Input
                                        type="date"
                                        aria-label="Первый день"
                                        value={row.from}
                                        disabled={disabled}
                                        aria-invalid={!!error}
                                        className={DATE_INPUT_CLASS}
                                        onChange={event =>
                                            onChange(row.id, {
                                                from: event.target.value,
                                            })
                                        }
                                    />
                                </TableCell>
                                <TableCell className="align-top">
                                    <Input
                                        type="date"
                                        aria-label="Последний день"
                                        value={row.to}
                                        disabled={disabled}
                                        aria-invalid={!!error}
                                        className={DATE_INPUT_CLASS}
                                        onChange={event =>
                                            onChange(row.id, {
                                                to: event.target.value,
                                            })
                                        }
                                    />
                                </TableCell>
                                <TableCell className="align-top">
                                    <MicroSelect
                                        ariaLabel="Вид отсутствия"
                                        value={row.kind}
                                        options={AI_ABSENCE_KIND_OPTIONS}
                                        disabled={disabled}
                                        onChange={kind =>
                                            isAiAbsenceKind(kind) &&
                                            onChange(row.id, { kind })
                                        }
                                    />
                                </TableCell>
                                <TableCell className="align-top">
                                    <IconAction
                                        icon={Trash2}
                                        label="Удалить отсутствие"
                                        disabled={disabled}
                                        onClick={() => onRemove(row.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        )}
        <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled={disabled || managers.length === 0}
            onClick={onAdd}
        >
            <Plus className="h-3 w-3" />
            Добавить отсутствие
        </Button>
        {managers.length === 0 && (
            <p className="text-xs text-muted-foreground">
                Сначала дождитесь обзора — менеджеры берутся из него.
            </p>
        )}
    </div>
);
