'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    Briefcase,
    Phone,
    Calendar,
    Kanban,
    BarChart3,
    List,
    Play,
    CheckCircle2
} from 'lucide-react';
import { scrollToSectionWithSource } from '../utils/tracking';

const benefits = [
    {
        icon: Briefcase,
        title: 'Удобное рабочее место',
        description: 'Простое, удобное и уже настроенное рабочее место с готовыми инструментами',
    },
    {
        icon: Phone,
        title: 'Автоматизированные холодные обзвоны',
        description: 'Фильтры, очереди, сегментация компаний. Учет фактических звонков. KPI заполняется сам',
    },
    {
        icon: Calendar,
        title: 'Планировщик звонков',
        description: 'Виджет планирования событий и звонков с автоматическим контролем выполнения',
    },
    {
        icon: Kanban,
        title: 'Канбан сделок с авто-переходами',
        description: 'Полностью автоматизированный канбан, который сам ведёт по процессу продаж',
    },
    {
        icon: BarChart3,
        title: 'KPI фиксируется сам',
        description: 'Система автоматически собирает данные и формирует отчёты без участия менеджера',
    },
    {
        icon: List,
        title: 'Ежедневная работа из любого списка',
        description: 'Работа из списков компаний, событий, сделок — всё в одном месте',
    },
];

export const ManagerBenefits: React.FC = () => {

    return (
        <section className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Менеджеру по продажам — комфортная и прозрачная работа
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Менеджер получает полностью настроенное рабочее место.
                        Не нужно думать о стадиях, KPI или шагах — система сама ведёт по процессу.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => scrollToSectionWithSource('#contact', 'manager_benefits')}
                        className="text-lg px-8 py-6"
                    >
                        <Play className="mr-2 h-5 w-5" />
                        Попробовать демо
                    </Button>
                </div>
            </div>
        </section>
    );
};

