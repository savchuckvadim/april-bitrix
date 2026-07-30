import React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import {
    calculateMonthlyPayments,
    getDealDuration,
} from '../lib/utils/timeline.utils';
import { formatNumber } from '../lib/utils/format.utils';

interface CompanyDealsDetailsProps {
    companyData: OrkReportDealsByCompaniesDto;
}

/**
 * Раскрытая детализация сделок компании с ежемесячными платежами.
 * React.memo: расчёт платежей и разметка сотен ячеек не должны
 * повторяться при скролле/раскрытии других строк.
 */
export const CompanyDealsDetails: React.FC<CompanyDealsDetailsProps> =
    React.memo(({ companyData }) => (
        <Card className="m-2">
            <CardContent className="p-3">
                <div className="text-sm font-medium mb-2">
                    Детализация сделок с ежемесячными платежами (
                    {companyData.deals.length} сделок)
                </div>
                <div className="grid gap-2">
                    {companyData.deals.map(deal => {
                        const duration = deal.duration || getDealDuration(deal);
                        const monthlyAmount =
                            deal.monthSum || +deal.sum / duration;
                        const from = new Date(deal.from);
                        const to = new Date(deal.to);
                        const payments = calculateMonthlyPayments(deal);
                        const isSuccessful = deal.isWon;
                        const isLost = deal.isLost;
                        return (
                            <div key={deal.id} className="border rounded p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="font-medium">
                                                {deal.title ||
                                                    `Сделка #${deal.id}`}
                                            </div>
                                            <Badge
                                                variant={
                                                    isSuccessful
                                                        ? 'default'
                                                        : isLost
                                                          ? 'destructive'
                                                          : 'secondary'
                                                }
                                                className={cn(
                                                    'text-xs',
                                                    isSuccessful
                                                        ? 'text-green-600 bg-green-100'
                                                        : isLost
                                                          ? 'text-red-600 bg-red-100'
                                                          : 'text-yellow-600 bg-yellow-100',
                                                )}
                                            >
                                                {isSuccessful
                                                    ? 'Успешная'
                                                    : isLost
                                                      ? 'Отказ'
                                                      : 'В процессе'}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {from.toLocaleDateString('ru-RU')} –{' '}
                                            {to.toLocaleDateString('ru-RU')} (
                                            {duration} мес)
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Ответственный:{' '}
                                            {deal.assignedById || 'Не назначен'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-lg">
                                            {formatNumber(+deal.sum)} ₽
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatNumber(monthlyAmount)} ₽/мес
                                        </div>
                                    </div>
                                </div>

                                {/* Ежемесячные платежи */}
                                <div className="grid grid-cols-6 gap-1 mt-2">
                                    {payments.map((payment, paymentIdx) => {
                                        const paymentDate = new Date(from);
                                        paymentDate.setMonth(
                                            paymentDate.getMonth() + paymentIdx,
                                        );
                                        const monthName =
                                            paymentDate.toLocaleDateString(
                                                'ru-RU',
                                                { month: 'short' },
                                            );

                                        return (
                                            <div
                                                key={paymentIdx}
                                                className="text-center p-1 bg-muted rounded text-xs"
                                            >
                                                <div className="font-medium">
                                                    {monthName}
                                                </div>
                                                <div className="text-green-600">
                                                    {formatNumber(
                                                        payment.amount,
                                                    )}{' '}
                                                    ₽
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    ));

CompanyDealsDetails.displayName = 'CompanyDealsDetails';
