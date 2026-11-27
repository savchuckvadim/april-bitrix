'use client';

import type { ComponentType } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { TONE_SOFT, type Tone } from '@workspace/april-ui/tones';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import type { InvoiceCheckState } from '../hooks/use-invoice-check-criteria';
import type { ResolverCardKind, ResolverCardView } from '../lib/resolver-card.util';
import { InvoiceCheckSelect } from './InvoiceCheckSelect';

export interface InvoiceTemplateResolverCardProps {
    card: ResolverCardView;
    isRefreshing: boolean;
    /** Привязка найденного шаблона для подписи под заголовком. */
    bindingLabel: string | null;
    check: InvoiceCheckState;
}

const KIND_ICON: Record<ResolverCardKind, ComponentType<{ className?: string }>> = {
    idle: Info,
    loading: Loader2,
    found: CheckCircle2,
    missing: AlertTriangle,
    error: AlertCircle,
};

const KIND_TONE: Record<ResolverCardKind, Tone> = {
    idle: 'muted',
    loading: 'muted',
    found: 'success',
    missing: 'warning',
    error: 'destructive',
};

/**
 * Карточка «Сейчас уйдёт шаблон»: ответ подбора на сервере для портала,
 * поставщика, типа клиента и типа поставки. Признаки по умолчанию берутся из
 * конструктора, а здесь их можно сменить, чтобы проверить другой случай.
 */
export const InvoiceTemplateResolverCard = ({
    card,
    isRefreshing,
    bindingLabel,
    check,
}: InvoiceTemplateResolverCardProps) => {
    const Icon = KIND_ICON[card.kind];

    return (
        <Card
            className={cn('gap-3 py-4 transition-opacity', isRefreshing && 'opacity-70')}
            aria-busy={isRefreshing}
        >
            <CardContent className="flex flex-col gap-3 px-4 sm:px-6">
                <div className="flex items-start gap-3">
                    <span
                        className={cn(
                            'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                            TONE_SOFT[KIND_TONE[card.kind]],
                        )}
                    >
                        <Icon
                            aria-hidden
                            className={cn('size-4', card.kind === 'loading' && 'animate-spin')}
                        />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-medium">{card.title}</p>
                        {bindingLabel ? (
                            <p className="text-xs text-muted-foreground">
                                Привязка: {bindingLabel}
                            </p>
                        ) : null}
                        {card.details ? (
                            <p className="text-xs text-muted-foreground">{card.details}</p>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3">
                    <span className="text-xs text-muted-foreground">Проверить для</span>
                    {check.providerOptions.length > 1 ? (
                        <InvoiceCheckSelect
                            label="Поставщик"
                            value={check.providerValue}
                            options={check.providerOptions}
                            onChange={check.pickProvider}
                        />
                    ) : null}
                    <InvoiceCheckSelect
                        label="Тип клиента"
                        value={check.clientValue}
                        options={check.clientOptions}
                        onChange={check.pickClientType}
                    />
                    <InvoiceCheckSelect
                        label="Тип поставки"
                        value={check.supplyValue}
                        options={check.supplyOptions}
                        onChange={check.pickSupplyType}
                    />
                    {check.isCustom ? (
                        <Button variant="ghost" size="sm" onClick={check.resetPicked}>
                            Как в сделке
                        </Button>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};
