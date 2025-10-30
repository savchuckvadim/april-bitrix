'use client';
import { Button } from "@workspace/ui/components/button";

export interface FilterButtonProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}
export const FilterButton = ({ isFilterOpen, setIsFilterOpen }: FilterButtonProps) => {
    return (
        <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
            {isFilterOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
        </Button>
    );
};
