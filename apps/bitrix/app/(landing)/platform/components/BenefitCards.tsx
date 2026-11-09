import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import type { PlatformBenefit } from '../model/types';

export interface BenefitCardsProps {
    items: readonly PlatformBenefit[];
    columns?: 2 | 3;
}

/** Карточки «выгода → как достигается». */
export function BenefitCards({ items, columns = 3 }: BenefitCardsProps) {
    return (
        <div className={cn('grid gap-5 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
            {items.map(item => (
                <Card key={item.title} className="h-full py-0">
                    <CardContent className="flex flex-col gap-3 p-6">
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        <p className="text-pretty text-muted-foreground">{item.text}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
