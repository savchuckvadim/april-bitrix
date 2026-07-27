'use client';

import React from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    FinanceDealsSubTable,
    HotClientsWidget,
} from '@/modules/widgets/finance-report';

interface UserFinanceTabProps {
    userId: number;
}

/** Финансы менеджера в user report: его продажи + горячие клиенты (виджет). */
export const UserFinanceTab: React.FC<UserFinanceTabProps> = ({ userId }) => {
    const { status, report } = useAppSelector(
        state => state.finance.userFinance,
    );

    const employee = report?.employees.find(
        emp => emp.assignedId === userId,
    );

    return (
        <div className="space-y-6">
            <section>
                <h3 className="mb-2 text-lg font-semibold text-primary">
                    Продажи
                </h3>
                {status === 'loading' && (
                    <p className="text-sm text-muted-foreground">
                        Загружаем…
                    </p>
                )}
                {status === 'ready' && employee?.deals.length ? (
                    <FinanceDealsSubTable deals={employee.deals} />
                ) : (
                    status === 'ready' && (
                        <p className="text-sm text-muted-foreground">
                            Продаж за период нет
                        </p>
                    )
                )}
            </section>

            {/* Горячие клиенты менеджера — тот же виджет с фильтрами/сводкой. */}
            <HotClientsWidget userId={userId} />
        </div>
    );
};
