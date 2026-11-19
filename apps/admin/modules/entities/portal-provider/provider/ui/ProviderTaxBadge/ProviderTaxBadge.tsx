'use client';

import { Badge } from '@workspace/ui/components/badge';
import { PROVIDER_TAX_TEXT } from '../../model';

interface ProviderTaxBadgeProps {
    withTax: boolean;
}

/** Работает ли поставщик с НДС: значок в карточке поставщика. */
export function ProviderTaxBadge({ withTax }: ProviderTaxBadgeProps) {
    return (
        <Badge variant={withTax ? 'secondary' : 'outline'} title={PROVIDER_TAX_TEXT.hint}>
            {withTax ? PROVIDER_TAX_TEXT.withTax : PROVIDER_TAX_TEXT.withoutTax}
        </Badge>
    );
}
