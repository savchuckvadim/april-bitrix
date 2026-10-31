'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useRegionField } from '../hooks/use-region-field';

export interface RegionFieldProps {
    value: string | null;
    onChange: (regionCode: string) => void;
}

/** Регион клиента: от него зависят цены и региональный инфоблок. */
export const RegionField = ({ value, onChange }: RegionFieldProps) => {
    const field = useRegionField(value);

    return (
        <SectionCard
            title="Регион"
            description="Определяет цены и региональный инфоблок."
            actions={
                field.canToggle ? (
                    <Button variant="ghost" size="sm" onClick={field.toggleShowAll}>
                        {field.showAll ? 'Только регионы портала' : 'Все регионы'}
                    </Button>
                ) : null
            }
        >
            <Select value={value ?? undefined} onValueChange={onChange}>
                <SelectTrigger className="w-full sm:w-80">
                    <SelectValue placeholder="Выберите регион" />
                </SelectTrigger>
                <SelectContent>
                    {field.regions.map(region => (
                        <SelectItem key={region.code} value={region.code}>
                            {region.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </SectionCard>
    );
};
