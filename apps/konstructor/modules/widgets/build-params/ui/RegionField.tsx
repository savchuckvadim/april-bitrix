'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import type { KRegion } from '@/modules/entities/catalog';

export interface RegionFieldProps {
    regions: KRegion[];
    value: string | null;
    onChange: (regionCode: string) => void;
}

/** Регион клиента: от него зависят цены и региональный инфоблок. */
export const RegionField = ({ regions, value, onChange }: RegionFieldProps) => (
    <SectionCard
        title="Регион"
        description="Определяет цены и региональный инфоблок."
    >
        <Select value={value ?? undefined} onValueChange={onChange}>
            <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Выберите регион" />
            </SelectTrigger>
            <SelectContent>
                {regions.map(region => (
                    <SelectItem key={region.code} value={region.code}>
                        {region.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </SectionCard>
);
