'use client';

import { Search } from 'lucide-react';
import { MicroSegmented } from '@workspace/april-ui/fields';
import { Input } from '@workspace/ui/components/input';
import { TEMPLATE_SHOP_SCOPES, type TemplateShopScope } from '../lib/template-shop.util';

export interface TemplateShopToolbarProps {
    scope: TemplateShopScope;
    search: string;
    shown: number;
    total: number;
    onScope: (scope: TemplateShopScope) => void;
    onSearch: (search: string) => void;
}

/** Вкладки витрины, поиск и счётчик найденного. */
export const TemplateShopToolbar = ({ scope, search, shown, total, onScope, onSearch }: TemplateShopToolbarProps) => (
    <div className="flex flex-wrap items-center gap-3">
        <MicroSegmented
            ariaLabel="Какие шаблоны показать"
            value={scope}
            options={TEMPLATE_SHOP_SCOPES}
            onChange={value => onScope(value as TemplateShopScope)}
        />
        <div className="relative min-w-48 flex-1 sm:max-w-80">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
                value={search}
                onChange={event => onSearch(event.target.value)}
                placeholder="Название, код, теги"
                aria-label="Поиск шаблона"
                className="pl-8"
            />
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
            Показано {shown} из {total}
        </span>
    </div>
);
