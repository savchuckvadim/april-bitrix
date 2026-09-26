'use client';

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
import { formatAiMoment } from '@/modules/entities/ai-analytics';
import { useAiStyle } from '../hooks/use-ai-style';
import { useAiManagerName } from '../hooks/use-ai-manager-name';
import {
    aiFunnelShapeLabel,
    formatAiStyleMonth,
    formatAiStyleWindow,
} from '../lib/ai-style.util';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiSectionState } from './components/AiSectionState';
import { AiStyleNotes } from './components/AiStyleNotes';
import { AiStyleTagChip } from './components/AiStyleTagChip';
import { AiStyleAxisRow } from './components/AiStyleAxisRow';
import { AiStyleHowWeCount } from './components/AiStyleHowWeCount';

export interface AiStyleDialogProps {
    managerId: string;
    /** Месяц окна YYYY-MM; без месяца — последний рассчитанный профиль. */
    month?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SECTION_TITLE =
    'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

/**
 * Карточка стиля менеджера (manager/style): КАК человек работает —
 * заметные особенности, подписи с опорой в числах, оси с отклонением от
 * нормы коллег (σ, интервал 80 %, n, доверие), форма воронки как
 * контекст, «Как считаем». Стиль — не оценка качества: в нормы, цели и
 * премии не входит. few_data / opt_out — текст note; stale — пометка;
 * 403 — текст сервера с «Повторить».
 */
export const AiStyleDialog = ({
    managerId,
    month,
    open,
    onOpenChange,
}: AiStyleDialogProps) => {
    const style = useAiStyle(managerId, month, open);
    const managerName = useAiManagerName();
    const card = style.data;
    const tags = card?.profile?.tags ?? [];

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            intensity="soft"
            cardClassName="max-h-[85vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <div className="flex items-center gap-2">
                    <DialogTitle>Стиль: {managerName(managerId)}</DialogTitle>
                    <AiHowWeCountButton endpoint="manager/style" />
                </div>
                <DialogDescription>
                    Как менеджер работает — отклонение от нормы коллег по осям
                    стиля. Это не оценка качества: у каждой оси два законных
                    полюса.
                </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                <AiSectionState
                    status={style.status}
                    error={style.error}
                    loadingText="Читаем профиль стиля…"
                    onRetry={style.retry}
                />
                {card && (
                    <>
                        <AiStyleNotes card={card} />
                        {card.notable.length > 0 && (
                            <section>
                                <h4 className={SECTION_TITLE}>
                                    Заметные особенности
                                </h4>
                                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                                    {card.notable.map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {tags.length > 0 && (
                            <section>
                                <h4 className={SECTION_TITLE}>Подписи стиля</h4>
                                <ul className="mt-1 space-y-1">
                                    {tags.map(tag => (
                                        <li
                                            key={tag.code}
                                            className="flex flex-wrap items-center gap-2 text-xs"
                                        >
                                            <AiStyleTagChip tag={tag} />
                                            <span className="text-muted-foreground">
                                                {tag.basis} · n = {tag.n}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {card.profile && (
                                    <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                                        Сравнимых разборов в окне:{' '}
                                        {card.profile.calls}
                                    </p>
                                )}
                            </section>
                        )}
                        {card.axes.length > 0 && (
                            <section>
                                <h4 className={SECTION_TITLE}>Оси стиля</h4>
                                <Table className="mt-1">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ось</TableHead>
                                            <TableHead className="text-right">
                                                −
                                            </TableHead>
                                            <TableHead>Шкала −3…+3 σ</TableHead>
                                            <TableHead>+</TableHead>
                                            <TableHead className="text-right">
                                                σ
                                            </TableHead>
                                            <TableHead className="text-right">
                                                n
                                            </TableHead>
                                            <TableHead>Доверие</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {card.axes.map(axis => (
                                            <AiStyleAxisRow
                                                key={axis.code}
                                                axis={axis}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </section>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Форма воронки (контекст, в оси стиля не входит):{' '}
                            <span className="font-medium text-foreground">
                                {aiFunnelShapeLabel(card.funnelShape)}
                            </span>
                        </p>
                        <AiStyleHowWeCount items={card.howWeCount} />
                    </>
                )}
            </div>
            {card && (
                <DialogFooter className="flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-muted-foreground sm:justify-start">
                    <span>
                        Месяц профиля: {formatAiStyleMonth(card.monthKey)}
                    </span>
                    <span>Окно: {formatAiStyleWindow(card.window)}</span>
                    <span>
                        Рассчитан:{' '}
                        {card.generatedAt
                            ? formatAiMoment(card.generatedAt)
                            : '—'}
                    </span>
                </DialogFooter>
            )}
        </GlassDialog>
    );
};
