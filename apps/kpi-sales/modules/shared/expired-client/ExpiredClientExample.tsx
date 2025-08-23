"use client";

import React from "react";
import { ExpiredClientPage } from "./ExpiredClientPage";

export const ExpiredClientExample: React.FC = () => {
  const handleComplete = () => {
    console.log("✅ Таймер завершен");
    // Здесь можно добавить логику для восстановления доступа
  };

  const handleDispatch = () => {
    console.log("🚀 Диспатчим событие восстановления доступа");
    // Здесь можно добавить логику для диспатча события
    // Например, отправка уведомления, обновление состояния и т.д.
  };

  return (
    <ExpiredClientPage
      onComplete={handleComplete}
      onDispatch={handleDispatch}
    />
  );
};

export default ExpiredClientExample;
