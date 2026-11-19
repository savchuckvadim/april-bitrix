'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import type { ComplectVariantsState } from '../hooks/use-complect-variants';

export interface ComplectVariantCreateFormProps {
    variants: ComplectVariantsState;
}

/** Название и кнопка: текущая сборка сохраняется как новый вариант. */
export const ComplectVariantCreateForm = ({ variants }: ComplectVariantCreateFormProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <Input
            className="h-8 w-48 text-sm"
            placeholder="Название варианта"
            aria-label="Название варианта"
            value={variants.newTitle}
            disabled={variants.isBusy}
            onChange={event => variants.setNewTitle(event.target.value)}
        />
        <Button
            size="sm"
            variant="outline"
            disabled={variants.isBusy}
            onClick={() => void variants.create()}
        >
            Сохранить как вариант
        </Button>
    </div>
);
