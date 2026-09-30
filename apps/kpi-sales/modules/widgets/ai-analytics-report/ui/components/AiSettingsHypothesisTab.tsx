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
import { IconAction } from '@workspace/april-ui';
import {
    AI_HYPOTHESIS_INCONSISTENT_TEXT,
    AI_HYPOTHESIS_PAIRS_MIN,
    AI_HYPOTHESIS_SCORE,
    aiHypothesisPairs,
    isAiHypothesisInconsistent,
    type AiHypothesisErrors,
    type AiHypothesisFormRow,
} from '../../lib/ai-settings-form.hypothesis';
import {
    AI_SETTINGS_PHASE4_HINT,
    type AiSettingsPhase4State,
} from '../../lib/ai-settings-form.phase4';
import { AiTheoryLink } from './AiTheoryLink';

interface AiSettingsHypothesisTabProps {
    /**
     * ready — строки показывают текущую гипотезу портала; loading — ещё
     * грузится; outdated — старый сервер гипотезу не присылает.
     */
    state: AiSettingsPhase4State;
    rows: AiHypothesisFormRow[];
    /** null — гипотезу не правили. */
    errors: AiHypothesisErrors | null;
    disabled: boolean;
    onAdd: () => void;
    onChange: (
        id: number,
        changes: Partial<Omit<AiHypothesisFormRow, 'id'>>,
    ) => void;
    onRemove: (id: number) => void;
}

const [SCORE_MIN, SCORE_MAX] = AI_HYPOTHESIS_SCORE;
const NUMBER_INPUT_CLASS = 'h-7 max-w-24 text-xs';

/**
 * Вкладка «Гипотеза качества»: пары «при оценке качества S нужно N
 * презентаций», добавить/удалить строку, минимум две пары, предупреждение,
 * если с ростом качества нужное число растёт.
 */
export const AiSettingsHypothesisTab = ({
    state,
    rows,
    errors,
    disabled: disabledProp,
    onAdd,
    onChange,
    onRemove,
}: AiSettingsHypothesisTabProps) => {
    // Пока текущая гипотеза не пришла (грузится или сервер старый), пустые
    // строки затёрли бы гипотезу портала.
    const hint = AI_SETTINGS_PHASE4_HINT[state];
    const disabled = disabledProp || hint !== null;
    const inconsistent = isAiHypothesisInconsistent(aiHypothesisPairs(rows));
    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Ваше правило: сколько презентаций нужно менеджеру при разном
                качестве разговора (оценка разбора от {SCORE_MIN} до {SCORE_MAX}
                ). Это правило портала для калькулятора «что если», в планы оно
                не попадает. Когда связь качества с результатом оценится по
                данным, витрина возьмёт её вместо правила. Сравнимую историю
                правка не рвёт.
            </p>
            {hint !== null && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>При оценке качества</TableHead>
                        <TableHead>Нужно презентаций</TableHead>
                        <TableHead className="w-8" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => {
                        const error = errors?.rows.get(row.id);
                        return (
                            <TableRow key={row.id}>
                                <TableCell className="align-top">
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        min={SCORE_MIN}
                                        max={SCORE_MAX}
                                        aria-label="Оценка качества"
                                        value={row.s}
                                        disabled={disabled}
                                        aria-invalid={!!error}
                                        className={NUMBER_INPUT_CLASS}
                                        onChange={event =>
                                            onChange(row.id, {
                                                s: event.target.value,
                                            })
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
                                        type="number"
                                        inputMode="decimal"
                                        min={1}
                                        aria-label="Нужно презентаций"
                                        value={row.n}
                                        disabled={disabled}
                                        aria-invalid={!!error}
                                        className={NUMBER_INPUT_CLASS}
                                        onChange={event =>
                                            onChange(row.id, {
                                                n: event.target.value,
                                            })
                                        }
                                    />
                                </TableCell>
                                <TableCell className="align-top">
                                    <IconAction
                                        icon={Trash2}
                                        label="Удалить пару"
                                        disabled={disabled}
                                        onClick={() => onRemove(row.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {errors?.total && (
                <p className="text-xs text-destructive">{errors.total}</p>
            )}
            {inconsistent && (
                <p className="text-xs text-warning">
                    {AI_HYPOTHESIS_INCONSISTENT_TEXT}
                </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={disabled}
                    onClick={onAdd}
                >
                    <Plus className="h-3 w-3" />
                    Добавить пару
                </Button>
                <span className="text-[0.6875rem] text-muted-foreground">
                    Для сохранения нужно не меньше {AI_HYPOTHESIS_PAIRS_MIN}{' '}
                    пар; пустые строки не сохраняются.
                </span>
                <AiTheoryLink topic="qualityLink" />
            </div>
        </div>
    );
};
