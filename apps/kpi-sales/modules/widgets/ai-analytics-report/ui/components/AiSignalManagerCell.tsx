'use client';

import Link from 'next/link';
import { Fingerprint, FolderOpen, type LucideIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip } from '@workspace/april-ui';
import type { AiManagerRow } from '@/modules/entities/ai-analytics';
import { useAiManagerLink } from '../../hooks/use-ai-manager-link';
import {
    aiAnalyzedView,
    aiTenureLabel,
    type AiAnalyzedContext,
} from '../../lib/ai-signal.util';
import { AI_SIGNAL_ROW_BUTTON } from '../../lib/ai-signal.texts';
import { AiManagerName } from './AiManagerName';
import { AiLevelBadge } from './AiLevelBadge';
import { AiStyleTagChip } from './AiStyleTagChip';

interface AiSignalManagerCellProps {
    row: AiManagerRow;
    analyzedCtx: AiAnalyzedContext;
    /** Запасной путь без ссылки на страницу (публичный снимок): диалог. */
    onOpenStyle: (managerId: string) => void;
    onOpenDossier: (managerId: string) => void;
}

const BUTTON = AI_SIGNAL_ROW_BUTTON;
const BUTTON_CLASS = 'h-6 gap-1 px-1 text-xs';

interface RowActionProps {
    icon: LucideIcon;
    label: string;
    hint: { title: string; lines: readonly string[] };
    /** Ссылка на страницу сотрудника; null — кнопка открывает диалог. */
    href: string | null;
    onClick: () => void;
}

/** Действие строки: ссылка на подвкладку страницы сотрудника либо кнопка диалога. */
const RowAction = ({ icon: Icon, label, hint, href, onClick }: RowActionProps) => (
    <HintTooltip title={hint.title} lines={[...hint.lines]}>
        {href ? (
            <Button asChild variant="ghost" size="sm" className={BUTTON_CLASS}>
                <Link href={href}>
                    <Icon className="h-3 w-3" />
                    {label}
                </Link>
            </Button>
        ) : (
            <Button
                variant="ghost"
                size="sm"
                className={BUTTON_CLASS}
                onClick={onClick}
            >
                <Icon className="h-3 w-3" />
                {label}
            </Button>
        )}
    </HintTooltip>
);

/**
 * Ячейка сотрудника: имя и уровень (ссылка на страницу сотрудника),
 * «разобрано N из M» (или «AI-разборов нет» с причиной в подсказке), стаж
 * с источником даты, подписи стиля, «Стиль» и «Досье» — ссылки на
 * подвкладки AI-раздела страницы сотрудника (без ссылки — диалоги).
 */
export const AiSignalManagerCell = ({
    row,
    analyzedCtx,
    onOpenStyle,
    onOpenDossier,
}: AiSignalManagerCellProps) => {
    const managerLink = useAiManagerLink();
    const analyzed = aiAnalyzedView(row, analyzedCtx);
    const tenure = aiTenureLabel(row);
    const styleTags = row.style?.tags ?? [];
    const analyzedText = (
        <span
            className={cn(
                analyzed.hint && 'cursor-help border-b border-dashed',
                analyzed.warning && 'text-warning',
            )}
        >
            {analyzed.text}
        </span>
    );

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <AiManagerName managerId={row.managerId} />
                <AiLevelBadge
                    level={row.level}
                    source={row.levelSource}
                    tenureMonths={row.tenureMonths}
                    funnelShape={row.funnelShape}
                />
            </div>
            <div className="text-[0.6875rem] text-muted-foreground">
                {analyzed.hint ? (
                    <HintTooltip
                        title={analyzed.hint.title}
                        lines={[...analyzed.hint.lines]}
                    >
                        {analyzedText}
                    </HintTooltip>
                ) : (
                    analyzedText
                )}{' '}
                · {tenure.text}
            </div>
            {tenure.hint && (
                <div className="text-[0.6875rem] text-warning">{tenure.hint}</div>
            )}
            {styleTags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                    {styleTags.map(tag => (
                        <AiStyleTagChip key={tag.code} tag={tag} />
                    ))}
                </div>
            )}
            <div className="mt-1 flex flex-wrap gap-1">
                <RowAction
                    icon={Fingerprint}
                    label={BUTTON.style.label}
                    hint={BUTTON.style.hint}
                    href={managerLink(row.managerId, 'style')}
                    onClick={() => onOpenStyle(row.managerId)}
                />
                <RowAction
                    icon={FolderOpen}
                    label={BUTTON.dossier.label}
                    hint={BUTTON.dossier.hint}
                    href={managerLink(row.managerId, 'brief')}
                    onClick={() => onOpenDossier(row.managerId)}
                />
            </div>
        </>
    );
};
