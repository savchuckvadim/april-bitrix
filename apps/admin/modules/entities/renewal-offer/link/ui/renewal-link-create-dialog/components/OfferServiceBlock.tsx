'use client';

import type { ReactNode } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';

interface OfferServiceBlockProps {
    id: string;
    title: string;
    /** Чем услуга обойдётся клиенту — короткой строкой справа. */
    priceNote?: string;
    included: boolean;
    onToggle: (included: boolean) => void;
    children: ReactNode;
}

/**
 * Блок одной услуги: переключатель «включаем или нет» и поля цен.
 * Выключенная услуга поля не прячет, а гасит — видно, что цена сохранится,
 * если включить обратно.
 */
export function OfferServiceBlock({
    id,
    title,
    priceNote,
    included,
    onToggle,
    children,
}: OfferServiceBlockProps) {
    return (
        <div className="rounded-lg border border-border p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Switch
                        id={id}
                        checked={included}
                        onCheckedChange={onToggle}
                    />
                    <Label htmlFor={id} className="text-sm font-medium">
                        {title}
                    </Label>
                </div>
                {priceNote ? (
                    <span className="text-sm font-medium text-foreground">
                        {priceNote}
                    </span>
                ) : null}
            </div>
            <div className={included ? undefined : 'opacity-50'}>{children}</div>
        </div>
    );
}
