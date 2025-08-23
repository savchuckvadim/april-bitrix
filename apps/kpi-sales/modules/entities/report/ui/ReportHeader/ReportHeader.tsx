import React from "react";
import { useReport } from "../../model";
import { Button } from "@workspace/ui/components/button";
import { DownLoad } from "@/modules/feature";
import { ThemeTogglePanel } from "./components/ThemeTogglerPanel/ThemeTogglePanel";
import SaveFilter from "./components/SaveFilter/SaveFilter";

export default function ReportHeader({
  isFilterOpen,
  setIsFilterOpen,
}: {
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}) {
  const { handleUpdateReport } = useReport();

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex flex-row">
        <ThemeTogglePanel />
        <h1 className="text-xl font-bold">KPI</h1>
      </div>
      <div className="flex flex-row items-center ">
        <div className="mr-2">{isFilterOpen && <SaveFilter />}</div>
        <div className="mr-2">
          {isFilterOpen ? (
            <>
              <Button
                variant="default"
                className="cursor-pointer"
                onClick={() => {
                  handleUpdateReport();
                  setIsFilterOpen(!isFilterOpen);
                }}
              >
                {"Применить"}
              </Button>
            </>
          ) : (
            <DownLoad />
          )}
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? "Скрыть фильтры" : "Показать фильтры"}
        </Button>
      </div>
    </div>
  );
}
