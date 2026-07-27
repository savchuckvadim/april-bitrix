'use client';
import { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useUserConversions } from './hooks/use-user-conversions';
import { ConversionStatCard } from './ConversionStatCard';

interface UserConversionsSummaryProps {
    userId: number;
}

/**
 * Сводка конверсий менеджера на фоне команды: компактные карточки по
 * шагам цепочки merged-блока (те же цифры), чемпионство и «зона роста».
 * Заголовок даёт секция-обёртка (UserReportSection).
 */
export const UserConversionsSummary: FC<UserConversionsSummaryProps> = ({
    userId,
}) => {
    const insight = useUserConversions(userId);
    if (!insight) return null;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {insight.steps.map(step => (
                    <ConversionStatCard
                        key={`${step.def.fromCode}->${step.def.toCode}`}
                        insight={step}
                    />
                ))}
            </div>
            {insight.bottleneck && (
                <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <p>
                        <span className="font-medium">Зона роста: </span>
                        конверсия «{insight.bottleneck.fromName} →{' '}
                        {insight.bottleneck.toName}» заметно ниже медианы
                        команды — стоит разобрать этот шаг воронки.
                    </p>
                </div>
            )}
        </div>
    );
};
