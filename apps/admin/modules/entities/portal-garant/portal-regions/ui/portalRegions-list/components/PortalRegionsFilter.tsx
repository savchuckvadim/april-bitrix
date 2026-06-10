'use client';

import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface PortalRegionsFilterProps {
    search: string;
    onSearchChange: (value: string) => void;
    isOwnRegionsFilter: boolean;
    onOwnRegionsFilterChange: (value: boolean) => void;
    isNotOwnRegionsFilter: boolean;
    onNotOwnRegionsFilterChange: (value: boolean) => void;
}

export function PortalRegionsFilter({
    search,
    onSearchChange,
    isOwnRegionsFilter,
    onOwnRegionsFilterChange,
    isNotOwnRegionsFilter,
    onNotOwnRegionsFilterChange,
}: PortalRegionsFilterProps) {
    return (
        <div className="space-y-4">
            <div>
                <Input
                    placeholder="Поиск по названию региона"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Badge
                    variant={isOwnRegionsFilter ? "default" : "outline"}
                    className={cn(
                        "cursor-pointer transition-all hover:opacity-80 select-none",
                        isOwnRegionsFilter
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => onOwnRegionsFilterChange(!isOwnRegionsFilter)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isOwnRegionsFilter}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOwnRegionsFilterChange(!isOwnRegionsFilter);
                        }
                    }}
                >
                    Регионы портала
                </Badge>
                <Badge
                    variant={isNotOwnRegionsFilter ? "default" : "outline"}
                    className={cn(
                        "cursor-pointer transition-all hover:opacity-80 select-none",
                        isNotOwnRegionsFilter
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => onNotOwnRegionsFilterChange(!isNotOwnRegionsFilter)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isNotOwnRegionsFilter}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNotOwnRegionsFilterChange(!isNotOwnRegionsFilter);
                        }
                    }}
                >
                    Не принадлежащие порталу
                </Badge>
            </div>
        </div>
    );
}
