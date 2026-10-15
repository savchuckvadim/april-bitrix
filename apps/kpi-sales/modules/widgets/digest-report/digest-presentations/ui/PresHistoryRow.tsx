'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import {
    PRES_STATUS_LABELS,
    type DigestPresentation,
} from '@/modules/entities/digest';
import { CrmClientLinks, CrmEntityLink } from '../../digest-section';
import { presRowTime, presStatusTone } from '../lib/presentations-chart.util';
import { formatPresValue } from '../lib/presentations-view.util';

interface PresHistoryRowProps {
    item: DigestPresentation;
    employeeName: string;
    domain: string;
}

/** Строка истории: время, сотрудник, статус, клиент, комплект, комментарии. */
export const PresHistoryRow = ({ item, employeeName, domain }: PresHistoryRowProps) => (
    <TableRow className="align-top text-xs">
        <TableCell className="tabular-nums text-muted-foreground">{presRowTime(item)}</TableCell>
        <TableCell className="font-medium">{employeeName}</TableCell>
        <TableCell>
            <div className="flex flex-col gap-1">
                <ToneBadge tone={presStatusTone(item.dayStatus)} variant="soft" size="sm">
                    {PRES_STATUS_LABELS[item.dayStatus]}
                </ToneBadge>
                {item.spontaneous && (
                    <ToneBadge tone="accent" variant="outline" size="sm">
                        спонтанная
                    </ToneBadge>
                )}
                {item.plannedAtStart && (
                    <ToneBadge tone="info" variant="outline" size="sm">
                        стояла на день
                    </ToneBadge>
                )}
            </div>
        </TableCell>
        <TableCell>
            <CrmClientLinks domain={domain} company={item.company} contact={item.contact} lead={item.lead} />
        </TableCell>
        <TableCell>
            <div className="flex flex-col">
                <CrmEntityLink domain={domain} kind="deal" entity={{ id: item.dealId, title: item.title }} />
                {item.baseDeal && (
                    <span className="text-muted-foreground">
                        <CrmEntityLink domain={domain} kind="deal" entity={item.baseDeal} prefix="основная: " />
                    </span>
                )}
            </div>
        </TableCell>
        <TableCell>
            {item.complectName ? (
                <div className="flex flex-col">
                    <span>{item.complectName}</span>
                    {item.sum > 0 && (
                        <span className="text-muted-foreground">
                            {formatPresValue(item.sum, 'money')}
                            {item.complectSource === 'base' && ' · с основной сделки'}
                        </span>
                    )}
                </div>
            ) : (
                <span className="text-muted-foreground">—</span>
            )}
        </TableCell>
        <TableCell className="max-w-80">
            <HintTooltip
                title="Комментарии"
                lines={[
                    `При планировании: ${item.planComment || '—'}`,
                    `После отработки: ${item.reportComment || '—'}`,
                    ...item.history.map(line => `История: ${line}`),
                ]}
            >
                <div className="cursor-help space-y-0.5">
                    {item.planComment && (
                        <p className="line-clamp-2 text-muted-foreground">план: {item.planComment}</p>
                    )}
                    {item.reportComment && <p className="line-clamp-2">итог: {item.reportComment}</p>}
                    {!item.planComment && !item.reportComment && (
                        <p className="line-clamp-2 text-muted-foreground">{item.history[0] ?? '—'}</p>
                    )}
                </div>
            </HintTooltip>
        </TableCell>
    </TableRow>
);
