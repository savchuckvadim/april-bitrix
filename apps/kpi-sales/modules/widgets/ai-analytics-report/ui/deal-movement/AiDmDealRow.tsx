'use client';

import { ToneBadge } from '@workspace/april-ui';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import type { AiDealMovementDeal } from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import {
    aiDmDealAmount,
    aiDmSince,
    aiDmStageTiming,
} from '../../lib/deal-movement/ai-deal-movement-format.util';
import { AI_DM_STATUS_TONE } from '../../lib/deal-movement/ai-deal-movement-status.util';
import { AiCardLink } from '../components/AiCardLink';

interface AiDmDealRowProps {
    deal: AiDealMovementDeal;
    /** Имя ответственного под названием; null — список одного менеджера. */
    managerName: string | null;
}

/**
 * Строка проблемной сделки: ссылка в Битрикс24 (новая вкладка), статус,
 * сумма, стадия со сроком, причина словами и с какой ночи в статусе.
 */
export const AiDmDealRow = ({ deal, managerName }: AiDmDealRowProps) => (
    <TableRow>
        <TableCell className="max-w-64 align-top">
            <AiCardLink href={deal.url} label={deal.title} className="font-medium" />
            {managerName && (
                <span className="block text-xs text-muted-foreground">{managerName}</span>
            )}
        </TableCell>
        <TableCell className="align-top">
            <ToneBadge tone={AI_DM_STATUS_TONE[deal.status]} variant="soft" size="sm">
                {deal.statusTitle}
            </ToneBadge>
        </TableCell>
        <TableCell className="text-right align-top tabular-nums whitespace-nowrap">
            {aiDmDealAmount(deal.amount)}
        </TableCell>
        <TableCell className="align-top">
            <span className="block">
                {deal.stageTitle ?? AI_DEAL_MOVEMENT_TEXT.deals.noStage}
            </span>
            <span className="block text-xs text-muted-foreground">
                {aiDmStageTiming(deal)}
            </span>
        </TableCell>
        <TableCell className="min-w-56 align-top text-xs whitespace-normal">
            {deal.reasons}
        </TableCell>
        <TableCell className="align-top text-xs whitespace-nowrap text-muted-foreground">
            {aiDmSince(deal.since)}
        </TableCell>
    </TableRow>
);
