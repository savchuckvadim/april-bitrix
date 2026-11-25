import { TableCell, TableRow } from '@workspace/ui/components/table';
import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import { formatDuration, formatScore, scoreTone } from '@/modules/entities/call-page';
import {
    CALLS_LIST_TEXT,
    callsListRowHref,
    formatCallsListMoment,
    type CallsListItem,
} from '@/modules/entities/calls-list';
import { CallsListCellLink } from './CallsListCellLink';
import { CallsListReviewsCell } from './CallsListReviewsCell';
import { CallsListRowBadges } from './CallsListRowBadges';

const T = CALLS_LIST_TEXT.table;

/**
 * Строка списка: дата и время, сотрудник, клиент (под ним бейджи звонка),
 * тип, длительность, оценка AI (цвет как на витрине), отзывы руководителей,
 * «Открыть». Каждая ячейка — ссылка на разбор (личная ссылка руководителя с
 * `?from=calls`).
 */
export const CallsListRow = ({ item }: { item: CallsListItem }) => {
    const href = callsListRowHref(item.url);
    return (
        <TableRow className={cn(href && 'cursor-pointer')}>
            <TableCell className="whitespace-nowrap tabular-nums">
                <CallsListCellLink href={href}>
                    {formatCallsListMoment(item.startedAt)}
                </CallsListCellLink>
            </TableCell>
            <TableCell className="min-w-40">
                <CallsListCellLink href={href}>
                    {item.managerName ?? T.noManager}
                </CallsListCellLink>
            </TableCell>
            <TableCell className="min-w-48 max-w-80">
                <CallsListCellLink href={href}>
                    <span className="line-clamp-2">{item.client ?? T.noValue}</span>
                    <CallsListRowBadges badges={item.badges} />
                </CallsListCellLink>
            </TableCell>
            <TableCell>
                <CallsListCellLink href={href}>
                    {item.callTypeTitle ? (
                        <ToneBadge tone="primary" variant="soft" size="sm">
                            {item.callTypeTitle}
                        </ToneBadge>
                    ) : (
                        T.noValue
                    )}
                </CallsListCellLink>
            </TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">
                <CallsListCellLink href={href}>
                    {formatDuration(item.durationSec) ?? T.noValue}
                </CallsListCellLink>
            </TableCell>
            <TableCell>
                <CallsListCellLink href={href}>
                    <ToneBadge tone={scoreTone(item.aiScore)} variant="soft">
                        {formatScore(item.aiScore)}
                    </ToneBadge>
                </CallsListCellLink>
            </TableCell>
            <TableCell className="min-w-40">
                <CallsListCellLink href={href}>
                    <CallsListReviewsCell reviews={item.reviews} />
                </CallsListCellLink>
            </TableCell>
            <TableCell className="whitespace-nowrap text-right">
                {href ? (
                    <a href={href} title={T.openTitle} className="text-sm text-primary hover:underline">
                        {T.openLink}
                    </a>
                ) : (
                    <span title={T.noLinkTitle} className="text-xs text-muted-foreground">
                        {T.noLink}
                    </span>
                )}
            </TableCell>
        </TableRow>
    );
};
