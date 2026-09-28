'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Input } from '@workspace/ui/components/input';
import { ToneBadge } from '@workspace/april-ui';
import {
    AI_LEVEL,
    AI_TARGET_LIMITS,
    type AiManagerLevel,
    type AiTargetField,
    type AiTargetOverrideInput,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import type { AiTargetFormRow } from '../../lib/ai-settings-form.util';
import { aiTargetErrorKey } from '../../lib/ai-settings-form.validate';
import { AI_TARGET_TIMING_LINES } from '../../lib/ai-target-timing.texts';

interface AiSettingsTargetsTabProps {
    rows: AiTargetFormRow[];
    /** Личные цели менеджеров из настроек — только показать. */
    overrides: AiTargetOverrideInput[];
    /** Ключ — aiTargetErrorKey(level, field). */
    errors: Map<string, string>;
    disabled: boolean;
    onChange: (
        level: AiManagerLevel,
        field: AiTargetField,
        value: string,
    ) => void;
}

/** Личные цели read-only: «Иванов — 5», снятая — «снята». */
const AiTargetOverrides = ({
    overrides,
}: {
    overrides: AiTargetOverrideInput[];
}) => {
    const managerName = useAiManagerName();
    return (
        <p className="text-[0.6875rem] text-muted-foreground">
            Личные цели менеджеров (сохраняются вместе с блоком без изменений):{' '}
            {overrides.length === 0
                ? 'нет.'
                : overrides
                      .map(
                          item =>
                              `${managerName(String(item.managerId))} — ${
                                  item.sales === null ||
                                  item.sales === undefined
                                      ? 'снята'
                                      : item.sales
                              }`,
                      )
                      .join('; ') + '.'}
        </p>
    );
};

/** Колонки целей: подпись и подсказка — из описаний DTO. */
const FIELDS: { field: AiTargetField; label: string; hint: string }[] = [
    {
        field: 'sales',
        label: 'Продаж в месяц',
        hint: 'пусто — у уровня цели нет',
    },
    {
        field: 'presentationsMin',
        label: 'Минимум презентаций',
        hint: 'обучающий минимум в месяц',
    },
    {
        field: 'coldPerDay',
        label: 'Холодных в день',
        hint: 'дневной минимум холодных звонков',
    },
];

const rangeLabel = (field: AiTargetField): string => {
    const [min, max] = AI_TARGET_LIMITS[field];
    return `${min}–${max}`;
};

/**
 * Вкладка «Цели по уровням»: три уровня, у каждого продажи, презентации, холодные.
 * Над таблицей — каскад цели плана дня и когда каждая ступень заработает.
 */
export const AiSettingsTargetsTab = ({
    rows,
    overrides,
    errors,
    disabled,
    onChange,
}: AiSettingsTargetsTabProps) => (
    <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
            Текущие цели портала; пусто в продажах — у уровня цели нет. Цель
            уровня работает, если у менеджера нет личной цели и плана в
            «Планах» (CRM) — они главнее. Сохранение перезаписывает цели всех
            трёх уровней.
        </p>
        <div className="space-y-0.5 text-[0.6875rem] text-muted-foreground">
            {AI_TARGET_TIMING_LINES.map(line => (
                <p key={line}>{line}</p>
            ))}
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Уровень</TableHead>
                    {FIELDS.map(column => (
                        <TableHead key={column.field}>
                            {column.label}
                            <span className="ml-1 text-[0.6875rem] font-normal text-muted-foreground">
                                {rangeLabel(column.field)}
                            </span>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(row => (
                    <TableRow key={row.level}>
                        <TableCell>
                            <ToneBadge
                                tone={AI_LEVEL[row.level].tone}
                                variant="outline"
                                size="sm"
                            >
                                {AI_LEVEL[row.level].label}
                            </ToneBadge>
                        </TableCell>
                        {FIELDS.map(column => {
                            const error = errors.get(
                                aiTargetErrorKey(row.level, column.field),
                            );
                            const [min, max] = AI_TARGET_LIMITS[column.field];
                            return (
                                <TableCell key={column.field}>
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        min={min}
                                        max={max}
                                        value={row[column.field]}
                                        placeholder={
                                            column.field === 'sales'
                                                ? 'нет цели'
                                                : undefined
                                        }
                                        disabled={disabled}
                                        aria-label={`${column.label}, ${AI_LEVEL[row.level].label}`}
                                        aria-invalid={!!error}
                                        title={column.hint}
                                        className="h-7 max-w-28 text-xs"
                                        onChange={event =>
                                            onChange(
                                                row.level,
                                                column.field,
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {error && (
                                        <p className="mt-1 text-[0.6875rem] text-destructive">
                                            {error}
                                        </p>
                                    )}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <p className="text-[0.6875rem] text-muted-foreground">
            {FIELDS.map(column => `${column.label} — ${column.hint}`).join(
                '; ',
            )}
            .
        </p>
        <AiTargetOverrides overrides={overrides} />
    </div>
);
