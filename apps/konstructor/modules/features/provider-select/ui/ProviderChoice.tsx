'use client';

import { ChoiceChips } from '@workspace/april-ui/fields';
import { Label } from '@workspace/ui/components/label';
import { useProviderChoice } from '../hooks/use-provider-choice';

/** Выбор поставщика документов чипами; поставщик один — ничего не рисуем. */
export const ProviderChoice = () => {
    const provider = useProviderChoice();

    if (!provider.canChoose) return null;

    return (
        <div className="flex flex-col gap-1">
            <Label>Поставщик</Label>
            <ChoiceChips
                ariaLabel="Поставщик документов"
                value={provider.currentId}
                options={provider.options}
                onChange={provider.set}
            />
        </div>
    );
};
