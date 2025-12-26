'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { X, Check } from 'lucide-react';

const comparison = [
    {
        feature: 'Стоимость',
        before: 'Дорогие внедрения',
        after: 'Небольшая цена установки',
    },
    {
        feature: 'Сроки',
        before: 'Месяцы настройки',
        after: '5 минут',
    },
    {
        feature: 'Подготовка',
        before: 'ТЗ, встречи, согласования',
        after: 'Всё уже продумано',
    },
    {
        feature: 'Обновления',
        before: 'Платить за обновления',
        after: 'Обновления включены',
    },
    {
        feature: 'Поддержка',
        before: 'Система ломается',
        after: 'Мы всё поддерживаем',
    },
];

export const ComparisonBlock: React.FC = () => {
    return (
        <section className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Почему это выгоднее внедрений
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Вы платите не за разработку — вы платите за результат.
                        Сэкономьте сотни часов работы и получите идеальную CRM уже сегодня.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <Card className="border-2 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-center text-2xl">
                                Сравнение подходов
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2">
                                            <th className="text-left p-4 font-semibold text-foreground">
                                                Критерий
                                            </th>
                                            <th className="text-center p-4 font-semibold text-destructive">
                                                Раньше
                                            </th>
                                            <th className="text-center p-4 font-semibold text-primary">
                                                Сейчас
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-medium text-foreground">
                                                    {item.feature}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-destructive">
                                                        <X className="h-5 w-5" />
                                                        <span className="text-muted-foreground">{item.before}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-primary">
                                                        <Check className="h-5 w-5" />
                                                        <span className="text-foreground font-medium">{item.after}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
};

