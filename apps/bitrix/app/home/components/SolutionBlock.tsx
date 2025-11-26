'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { CheckCircle2, Zap, Settings, BarChart3, FileText, Users, ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { scrollToSectionWithSource } from '../utils/tracking';

const solutionFeatures = [
    {
        icon: Zap,
        title: 'Установка за 5 минут',
        description: 'Модуль устанавливается в Bitrix24 за несколько минут без сложных настроек',
    },
    {
        icon: Settings,
        title: 'Готовые воронки и канбаны',
        description: 'Полностью настроенные воронки продаж под специфику ГАРАНТа',
    },
    {
        icon: Users,
        title: 'Автоматизация обзвонов',
        description: 'Холодные звонки, планирование, контроль активности менеджеров',
    },
    {
        icon: BarChart3,
        title: 'KPI фиксируется сам',
        description: 'Полноценный KPI-отчёт с рейтингами, графиками и детализацией',
    },
    {
        icon: FileText,
        title: 'Конструктор документов',
        description: 'КП, счета, договоры с автозаполнением и шаблонами под регионы',
    },
    {
        icon: CheckCircle2,
        title: 'Никакого ТЗ',
        description: 'Всё уже продумано и готово к работе с первого дня',
    },
];

export const SolutionBlock: React.FC = () => {

    return (
        <section className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Наше решение — что это за продукт
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                        Комплекс приложений для Bitrix24, который полностью перенастраивает CRM под продажи ГАРАНТа.
                        Включает виджеты, канбаны, документы, автоматизации, отчеты. Никакого ТЗ — всё готово.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {solutionFeatures.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center">
                    <Button
                        size="lg"
                        onClick={() => scrollToSectionWithSource('#contact', 'solution')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
                    >
                        Установить модуль
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

