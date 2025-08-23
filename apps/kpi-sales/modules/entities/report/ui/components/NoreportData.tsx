import { Preloader } from "@/modules/shared";
import React from "react";

export default function NoreportData() {
  return (
    <div className="h-[500px] min-w-full flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-xl font-bold">Нет данных для Отчета</h1>
        <p className="text-gray-500">Попробуйте изменить фильтры</p>
      </div>
      <div className="flex justify-center items-center mt-15">
        <Preloader size={"large"} />
      </div>
    </div>
  );
}
