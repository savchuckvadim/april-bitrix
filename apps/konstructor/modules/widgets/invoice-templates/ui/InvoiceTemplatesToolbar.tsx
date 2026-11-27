'use client';

import { RefreshCw } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';

export interface InvoiceTemplatesToolbarProps {
    shown: number;
    total: number;
    archived: number;
    showArchived: boolean;
    isRefreshing: boolean;
    /** Подпись квоты портала; нет портала, значит `null`. */
    quotaText: string | null;
    onShowArchived: (value: boolean) => void;
    onRefresh: () => void;
}

/** Панель над таблицей: квота портала, архив, счётчик и обновление. */
export const InvoiceTemplatesToolbar = ({
    shown,
    total,
    archived,
    showArchived,
    isRefreshing,
    quotaText,
    onShowArchived,
    onRefresh,
}: InvoiceTemplatesToolbarProps) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {quotaText ? (
            <span className="text-xs text-muted-foreground">{quotaText}</span>
        ) : null}
        {archived > 0 || showArchived ? (
            <div className="flex items-center gap-2">
                <Switch
                    id="invoice-templates-archive"
                    checked={showArchived}
                    onCheckedChange={onShowArchived}
                />
                <Label
                    htmlFor="invoice-templates-archive"
                    className="cursor-pointer text-xs font-normal"
                >
                    Показать архив ({archived})
                </Label>
            </div>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground">
            Показано {shown} из {total}
        </span>
        <IconAction
            icon={RefreshCw}
            label="Обновить список"
            disabled={isRefreshing}
            onClick={onRefresh}
            iconClassName={isRefreshing ? 'animate-spin' : undefined}
        />
    </div>
);
