'use client';

import React from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { CompanyColorBadge } from '@/modules/shared';
import { bitrixCompanyUrl, bitrixDealUrl } from '@/modules/entities/finance';

interface DealCompanyCellProps {
    domain: string;
    dealId: number;
    dealTitle: string;
    companyId: number | null;
    companyName: string | null;
    companyColor: string | null;
    /** Слот перед бэйджем (например шеврон раскрытия строки). */
    leading?: React.ReactNode;
}

/**
 * Ячейка «Компания» финансовых таблиц: точка-перспектива + имя-ссылка на
 * сделку (длинные имена обрезаются, полное — в тултипе) + иконка на
 * карточку компании. Единый вид для горячих клиентов и продаж.
 */
export const DealCompanyCell: React.FC<DealCompanyCellProps> = ({
    domain,
    dealId,
    dealTitle,
    companyId,
    companyName,
    companyColor,
    leading,
}) => {
    const displayName = companyName || dealTitle || `Сделка #${dealId}`;

    return (
        <span className="inline-flex max-w-full items-center gap-1.5">
            {leading}
            <CompanyColorBadge color={companyColor} />
            <Tooltip>
                <TooltipTrigger asChild>
                    <a
                        href={bitrixDealUrl(domain, dealId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={event => event.stopPropagation()}
                        className="min-w-0 max-w-[220px] truncate text-primary hover:underline"
                    >
                        {displayName}
                    </a>
                </TooltipTrigger>
                <TooltipContent className="max-w-[320px] text-xs">
                    {displayName}
                </TooltipContent>
            </Tooltip>
            {companyId ? (
                <a
                    href={bitrixCompanyUrl(domain, companyId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={event => event.stopPropagation()}
                    title="Открыть компанию"
                    className="text-muted-foreground hover:text-primary"
                >
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                </a>
            ) : (
                <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
            )}
        </span>
    );
};
