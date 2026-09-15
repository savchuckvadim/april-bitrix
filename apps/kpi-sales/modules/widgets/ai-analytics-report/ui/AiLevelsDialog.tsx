'use client';

import { Button } from '@workspace/ui/components/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { GlassDialog } from '@workspace/april-ui';
import { useAiLevelsForm } from '../hooks/use-ai-levels-form';
import { AiLevelRow } from './components/AiLevelRow';

interface AiLevelsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Уровни менеджеров (AI_CONFIGURE, руководители op/cup): форма по строкам
 * обзора → settings/save; после успеха сервер сбрасывает кэш обзора, а
 * listener перечитывает его принудительно.
 */
export const AiLevelsDialog = ({ open, onOpenChange }: AiLevelsDialogProps) => {
    const form = useAiLevelsForm(open, () => onOpenChange(false));

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            intensity="soft"
            cardClassName="max-h-[85vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <DialogTitle>Уровни менеджеров</DialogTitle>
                <DialogDescription>
                    Уровень определяет нормы и цели. По умолчанию — по стажу (до
                    6 месяцев — джун); дата стажа нужна только если хотите её
                    задать.
                </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {form.isEmpty ? (
                    <p className="py-4 text-sm text-muted-foreground">
                        Сначала дождитесь обзора — уровни задаются менеджерам из
                        него.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Менеджер</TableHead>
                                <TableHead>Уровень</TableHead>
                                <TableHead>Стаж с</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {form.rows.map(row => (
                                <AiLevelRow
                                    key={row.managerId}
                                    row={row}
                                    error={
                                        form.errors.get(row.managerId) ?? null
                                    }
                                    disabled={form.saving}
                                    onLevel={level =>
                                        form.setLevel(row.managerId, level)
                                    }
                                    onSince={since =>
                                        form.setSince(row.managerId, since)
                                    }
                                />
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            <DialogFooter className="items-center gap-2">
                {form.error && (
                    <p className="mr-auto text-xs text-destructive">
                        {form.error}
                    </p>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                >
                    Отмена
                </Button>
                <Button
                    size="sm"
                    disabled={form.saving || form.hasErrors || form.isEmpty}
                    onClick={form.submit}
                >
                    {form.saving ? 'Сохраняем…' : 'Сохранить'}
                </Button>
            </DialogFooter>
        </GlassDialog>
    );
};
