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
    AI_ABOUT_RELIABILITY_CATEGORY_LABELS,
    AI_ABOUT_SIGMA_SOURCE_LABELS,
    formatAiAboutKappa,
} from '../../lib/ai-about.util';

interface AiHowWeCountReliabilityProps {
    /** null — прогона test-retest на портале ещё не было. */
    reliability: AiAboutReliability | null;
}

/**
 * «Надёжность оценщика»: итог test-retest языковой модели — σ_llm и её
 * источник, согласие по полям разбора против порога golden_kappa_min
 * (ненадёжное поле подсвечено), F1 по возражениям, когда мерили.
 */
export const AiHowWeCountReliability = ({
    reliability,
}: AiHowWeCountReliabilityProps) => (
    <section className="space-y-2">
        <h4 className="text-sm font-medium">Надёжность оценщика</h4>
        {!reliability ? (
            <p className="text-xs text-muted-foreground">
                Повторный прогон разборов (test-retest) на портале ещё не
                делали: σ_llm взята из реестра, согласие по полям не измерено.
            </p>
        ) : (
            <>
                <p className="text-sm text-muted-foreground">
                    σ_llm = {reliability.sigmaLlm.value.toFixed(2)} (
                    {AI_ABOUT_SIGMA_SOURCE_LABELS[reliability.sigmaLlm.source]}
                    ; пар {reliability.sigmaLlm.n} из ценза{' '}
                    {reliability.sigmaLlm.minPairs}) · версия промпта{' '}
                    <code>{reliability.promptVersion}</code> · пар в отчёте{' '}
                    {reliability.pairs}
                    {reliability.withinQuota ? '' : ' (сверх квоты)'} · F1 по
                    возражениям {formatAiAboutKappa(reliability.objectionsF1)} ·{' '}
                    {formatAiMoment(reliability.generatedAt)}
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Поле разбора</TableHead>
                            <TableHead className="text-right">Пар</TableHead>
                            <TableHead className="text-right">κ</TableHead>
                            <TableHead>
                                Надёжно (κ ≥ {reliability.kappaMin})
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reliability.categories.map(category => (
                            <TableRow key={category.code}>
                                <TableCell>
                                    {AI_ABOUT_RELIABILITY_CATEGORY_LABELS[
                                        category.code
                                    ] ?? category.code}
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
