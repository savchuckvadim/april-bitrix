'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { ToneBadge } from '@workspace/april-ui';
import {
    formatAiMoment,
    type AiAboutReliability,
} from '@/modules/entities/ai-analytics';
import {
    aiAboutReliabilityCategoryLabel,
    formatAiAboutKappa,
    formatAiAboutReliabilityLine,
    formatAiAboutReliableHeader,
} from '../../lib/ai-about.util';

interface AiHowWeCountReliabilityProps {
    /** null — повторных разборов для проверки на портале ещё не было. */
    reliability: AiAboutReliability | null;
}

const NOT_MEASURED_TEXT =
    'Повторные разборы для проверки AI ещё не делали: разброс оценок взят по умолчанию.';

/**
 * «Надёжность оценок AI»: итог повторных разборов тех же звонков —
 * разброс оценок и на скольких парах он измерен, согласие по полям
 * разбора против порога (ненадёжное поле подсвечено), совпадение по
 * возражениям, когда мерили.
 */
export const AiHowWeCountReliability = ({
    reliability,
}: AiHowWeCountReliabilityProps) => (
    <section className="space-y-2">
        <h4 className="text-sm font-medium">Надёжность оценок AI</h4>
        {!reliability ? (
            <p className="text-xs text-muted-foreground">{NOT_MEASURED_TEXT}</p>
        ) : (
            <>
                <p className="text-sm text-muted-foreground">
                    {formatAiAboutReliabilityLine(reliability)} ·{' '}
                    {formatAiMoment(reliability.generatedAt)}
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Поле разбора</TableHead>
                            <TableHead className="text-right">Пар</TableHead>
                            <TableHead className="text-right">
                                Согласие
                            </TableHead>
                            <TableHead>
                                {formatAiAboutReliableHeader(
                                    reliability.kappaMin,
                                )}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reliability.categories.map(category => (
                            <TableRow key={category.code}>
                                <TableCell>
                                    {aiAboutReliabilityCategoryLabel(
                                        category.code,
                                    )}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {category.n}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatAiAboutKappa(category.kappa)}
                                </TableCell>
                                <TableCell>
                                    {category.reliable === null ? (
                                        <span className="text-muted-foreground">
                                            не определено
                                        </span>
                                    ) : (
                                        <ToneBadge
                                            tone={
                                                category.reliable
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                            variant="soft"
                                            size="sm"
                                        >
                                            {category.reliable
                                                ? 'надёжно'
                                                : 'ненадёжно'}
                                        </ToneBadge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </>
        )}
    </section>
);
