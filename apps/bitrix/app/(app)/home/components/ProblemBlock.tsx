'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { AlertCircle, Clock, DollarSign, FileX, Settings, TrendingDown } from 'lucide-react';

const problems = [
    {
        icon: DollarSign,
        title: 'Дорогие внедрения',
        description: 'Большие бюджеты на разработку и настройку CRM с нуля',
    },
    {
        icon: Clock,
        title: 'Долгое ТЗ',
        description: 'Месяцы на написание технического задания и согласования',
    },
    {
        icon: FileX,
        title: 'Обновления ломают систему',
        description: 'Каждое обновление Bitrix требует доработок и новых затрат',
    },
    {
        icon: TrendingDown,
        title: 'KPI ведут вручную',
        description: 'Ручной сбор данных, ошибки в отчетах, потеря времени',
    },
    {
        icon: Settings,
        title: 'Документы готовят часами',
        description: 'Ручное заполнение КП, счетов и договоров без автоматизации',
    },
    {
        icon: AlertCircle,
        title: 'Сложный B2B-процесс',
        description: 'Многоступенчатые воронки, презентации, холодные звонки без системы',
    },
];

export const ProblemBlock: React.FC = () => {
    return (
        <section className="py-20 lg:py-28 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Проблема, которую мы решаем
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Продажи ГАРАНТа — сложный и многоступенчатый B2B-процесс.
                        Раньше партнёрам приходилось тратить большие бюджеты на внедрения,
                        долго писать ТЗ, постоянно дорабатывать систему и вести KPI вручную.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {problems.map((problem, index) => {
                        const Icon = problem.icon;
                        return (
                            <Card key={index} className="border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-destructive" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                {problem.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {problem.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-2xl font-semibold text-foreground">
                        Теперь это не нужно.
                    </p>
                </div>
            </div>
        </section>
    );
};

