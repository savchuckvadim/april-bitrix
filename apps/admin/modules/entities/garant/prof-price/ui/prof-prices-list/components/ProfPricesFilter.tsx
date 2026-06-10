'use client';

import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface FilterOption {
    id: string;
    label: string;
}

interface ProfPricesFilterProps {
    selectedRegions: string[];
    onRegionsChange: (regions: string[]) => void;
    selectedSupplyTypes: string[];
    onSupplyTypesChange: (types: string[]) => void;
    selectedComplects: string[];
    onComplectsChange: (complects: string[]) => void;
    selectedSupplies: string[];
    onSuppliesChange: (supplies: string[]) => void;
    regionOptions: FilterOption[];
    supplyTypeOptions: FilterOption[];
    complectOptions: FilterOption[];
    supplyOptions: FilterOption[];
}

export function ProfPricesFilter({
    selectedRegions,
    onRegionsChange,
    selectedSupplyTypes,
    onSupplyTypesChange,
    selectedComplects,
    onComplectsChange,
    selectedSupplies,
    onSuppliesChange,
    regionOptions,
    supplyTypeOptions,
    complectOptions,
    supplyOptions,
}: ProfPricesFilterProps) {
    const toggleFilter = (
        value: string,
        selected: string[],
        onChange: (values: string[]) => void
    ) => {
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Тип региона</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    {regionOptions.map((option) => {
                        const isSelected = selectedRegions.includes(option.id);
                        return (
                            <Badge
                                key={option.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all hover:opacity-80 select-none",
                                    isSelected
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => toggleFilter(option.id, selectedRegions, onRegionsChange)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleFilter(option.id, selectedRegions, onRegionsChange);
                                    }
                                }}
                            >
                                {option.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium">Тип поставки</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    {supplyTypeOptions.map((option) => {
                        const isSelected = selectedSupplyTypes.includes(option.id);
                        return (
                            <Badge
                                key={option.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all hover:opacity-80 select-none",
                                    isSelected
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => toggleFilter(option.id, selectedSupplyTypes, onSupplyTypesChange)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleFilter(option.id, selectedSupplyTypes, onSupplyTypesChange);
                                    }
                                }}
                            >
                                {option.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium">Комплект</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    {complectOptions.map((option) => {
                        const isSelected = selectedComplects.includes(option.id);
                        return (
                            <Badge
                                key={option.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all hover:opacity-80 select-none",
                                    isSelected
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => toggleFilter(option.id, selectedComplects, onComplectsChange)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleFilter(option.id, selectedComplects, onComplectsChange);
                                    }
                                }}
                            >
                                {option.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium">Поставка</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    {supplyOptions.map((option) => {
                        const isSelected = selectedSupplies.includes(option.id);
                        return (
                            <Badge
                                key={option.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all hover:opacity-80 select-none",
                                    isSelected
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => toggleFilter(option.id, selectedSupplies, onSuppliesChange)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleFilter(option.id, selectedSupplies, onSuppliesChange);
                                    }
                                }}
                            >
                                {option.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
