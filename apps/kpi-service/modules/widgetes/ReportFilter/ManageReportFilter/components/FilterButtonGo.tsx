'use client';

import { Button } from "@workspace/ui/components/button";
import { useReport } from "@/modules/entities";
export interface FilterButtonGoProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}
export const FilterButtonGo = ({ isFilterOpen, setIsFilterOpen }: FilterButtonGoProps) => {

    const { handleUpdateReport } = useReport();
    return (
        <Button
            variant="default"
            className="cursor-pointer"
            onClick={() => {
                handleUpdateReport();
                setIsFilterOpen(!isFilterOpen);
            }}
        >
            {'Применить'}
        </Button>

    );
};
