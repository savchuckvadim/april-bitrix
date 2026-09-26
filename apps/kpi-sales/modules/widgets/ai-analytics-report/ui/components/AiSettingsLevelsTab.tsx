'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type {
    AiLevelFormRow,
    AiManagerLevel,
} from '@/modules/entities/ai-analytics';
import { AiLevelRow } from './AiLevelRow';

interface AiSettingsLevelsTabProps {
    rows: AiLevelFormRow[];
    errors: Map<number, string>;
    disabled: boolean;
    onLevel: (managerId: number, level: AiManagerLevel) => void;
    onSince: (managerId: number, since: string) => void;
}

/** Вкладка «Уровни»: строки обзора — уровень и дата начала стажа. */
export const AiSettingsLevelsTab = ({
    rows,
    errors,
    disabled,
    onLevel,
    onSince,
}: AiSettingsLevelsTabProps) => {
    if (rows.length === 0) {
        return (
            <p className="py-4 text-sm text-muted-foreground">
                Сначала дождитесь обзора — уровни задаются менеджерам из него.
            </p>
        );
    }
    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Уровень определяет нормы и цели. Без ручной настройки он
                считается по стажу из дат Bitrix (дата приёма или регистрации):
                до 6 мес. — джун, 6–18 — мидл, дальше — сеньор. Дату стажа
                задавайте, только если в Bitrix её нет или она неверна. При
                сохранении уровни всех менеджеров списка помечаются
                назначенными.
            </p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Менеджер</TableHead>
                        <TableHead>Уровень</TableHead>
                        <TableHead>Стаж с</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <AiLevelRow
                            key={row.managerId}
                            row={row}
                            error={errors.get(row.managerId) ?? null}
                            disabled={disabled}
                            onLevel={level => onLevel(row.managerId, level)}
                            onSince={since => onSince(row.managerId, since)}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
