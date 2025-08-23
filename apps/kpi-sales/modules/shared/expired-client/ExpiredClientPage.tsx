"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useApp } from "@/modules/app";

interface ExpiredClientPageProps {
  onComplete?: () => void;
  onDispatch?: () => void;
}

export const ExpiredClientPage: React.FC<ExpiredClientPageProps> = ({
  onComplete,
  onDispatch,
}) => {
  const [timeLeft, setTimeLeft] = useState(55); // 2 минуты в секундах
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const { sendExpiredStart, sendExpiredEnd } = useApp();
  useEffect(() => {
    if (!isStarted) {
      setIsStarted(true);
      sendExpiredStart();
    }
  }, [isStarted]);

  useEffect(() => {
    if (timeLeft <= 0) {
      sendExpiredEnd();
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    // Показать предупреждение через 30 секунд
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
    }, 30000);

    return () => clearTimeout(warningTimer);
  }, []);

  const handleComplete = () => {
    setIsLoading(true);
    // Имитация загрузки
    setTimeout(() => {
      onComplete?.();
      onDispatch?.();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressColor = () => {
    if (timeLeft > 60) return "text-green-600";
    if (timeLeft > 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressWidth = () => {
    return ((120 - timeLeft) / 120) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Внимание! Задолженность по оплате
          </CardTitle>

          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            Уважаемый клиент, у Вас имеется задолженность по оплате одного из нескольких сервисов
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Таймер */}
          <div className="text-center">
            <div className="mb-4">
              <Badge variant="destructive" className="text-sm px-4 py-2">
                Скорость загрузки будет снижена
              </Badge>
            </div>

            <div className="mb-6">
              <div className="text-6xl font-mono font-bold mb-2">
                <span className={getProgressColor()}>{formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Осталось времени до восстановления доступа
              </p>
            </div>

            {/* Прогресс бар */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4">
              <div
                className="h-3 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getProgressWidth()}%` }}
              />
            </div>
          </div>

          {/* Предупреждение */}
          {showWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Время истекает! Рекомендуем оплатить задолженность для восстановления полного доступа.
                </span>
              </div>
            </div>
          )}

          {/* Информация о сервисах */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Затронутые сервисы
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Основной доступ к системе</li>
                <li>• API интеграции</li>
                <li>• Техническая поддержка</li>
                <li>• Обновления и новые функции</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Что происходит сейчас
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Снижена скорость загрузки</li>
                <li>• Ограниченный функционал</li>
                <li>• Отложенная обработка запросов</li>
                <li>• Уведомления о статусе</li>
              </ul>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          {/* <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open("mailto:support@company.com", "_blank")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Связаться с поддержкой
          </Button>

          <Button
            variant="default"
            className="flex-1"
            onClick={() => window.open("/payment", "_blank")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Оплатить задолженность
          </Button> */}
        </CardFooter>
      </Card>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-700 dark:text-slate-300">Восстанавливаем доступ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredClientPage;
