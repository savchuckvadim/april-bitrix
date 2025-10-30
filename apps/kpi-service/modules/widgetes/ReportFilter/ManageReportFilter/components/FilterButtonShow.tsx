'use client';
import { Button } from "@workspace/ui/components/button";

export interface FilterButtonShowProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}
export const FilterButtonShow = ({ isFilterOpen, setIsFilterOpen }: FilterButtonShowProps) => {
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
