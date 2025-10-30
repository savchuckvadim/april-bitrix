import React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { CompanyStats } from '../model/types';

interface CompanyStatsProps {
    stats: CompanyStats;
    showIndex?: boolean;
}

export const CompanyStatsComponent: React.FC<CompanyStatsProps> = ({
    stats,
    showIndex = true
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    const getIndexColor = (index: number) => {
        if (index > 10) return 'bg-green-100 text-green-800';
        if (index > 0) return 'bg-blue-100 text-blue-800';
        if (index > -10) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="flex gap-2 text-xs">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col items-center min-w-[80px] cursor-help">
                            <div className="font-medium text-gray-500">Текущий</div>
                            <div className="font-bold text-gray-900">
                                {formatCurrency(stats.currentTotal)}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-sm">
                            <div className="font-semibold">Текущий показатель:</div>
                            <p>Сумма ежемесячных платежей в текущем году</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col items-center min-w-[80px] cursor-help">
                            <div className="font-medium text-gray-500">Средний</div>
                            <div className="font-bold text-gray-900">
                                {formatCurrency(stats.averageMonthly)}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-sm">
                            <div className="font-semibold">Средний показатель:</div>
                            <p>Средняя сумма в месяц только по месяцам с платежами</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col items-center min-w-[80px] cursor-help">
                            <div className="font-medium text-gray-500">Итого</div>
                            <div className="font-bold text-gray-900">
                                {formatCurrency(stats.periodTotal)}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-sm">
                            <div className="font-semibold">Итого за период:</div>
                            <p>Общая сумма всех сделок в выбранном периоде</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {showIndex && (
                <div className="flex flex-col items-center min-w-[80px]">
                    <div className="font-medium text-gray-500">Индексация</div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className={`text-xs ${getIndexColor(stats.indexGrowth)} cursor-help`}>
                                    {formatPercentage(stats.indexGrowth)}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <div className="space-y-2">
                                    <div className="font-semibold">Расчет индексации:</div>
                                    <div className="text-sm">
                                        <p>• Анализируется тренд изменения ежемесячных платежей</p>
                                        <p>• Используется линейная регрессия для сглаживания скачков</p>
                                        <p>• Учитываются все сделки клиента в выбранном периоде</p>
                                        <p>• Показывает общую динамику развития клиента</p>
                                    </div>
                                    <div className="text-xs text-gray-500 pt-1 border-t">
                                        Положительное значение = рост платежей<br />
                                        Отрицательное значение = снижение платежей
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
};
