'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Award, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

const achievements = [
    {
        icon: Award,
        title: '5+ лет опыта',
        description: 'Внедряем CRM для партнёров ГАРАНТа',
    },
    {
        icon: Users,
        title: 'Десятки компаний',
        description: 'Работали с партнёрами по всей стране',
    },
    {
        icon: TrendingUp,
        title: 'Анализ процессов',
        description: 'Изучили десятки моделей продаж и систем KPI',
    },
    {
        icon: CheckCircle2,
        title: 'Гибкая система',
        description: 'Подходит для строгой дисциплины и свободной структуры',
    },
];

export const AboutUs: React.FC = () => {
    return (
        <section id='about-us' className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        О нас: как мы пришли к этому решению
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto mb-12">
                    <div className="prose prose-lg max-w-none">
                        <p className="text-lg text-muted-foreground mb-6">
                            Мы — команда, которая более <strong className="text-foreground">5 лет автоматизирует отделы продаж</strong> партнёров ГАРАНТа.
                        </p>
                        <p className="text-lg text-muted-foreground mb-6">
                            За это время мы прошли путь от единичных внедрений до создания полноценного готового продукта,
                            который закрывает <strong className="text-foreground">90% типовых потребностей</strong> сразу «из коробки».
                        </p>
                        <p className="text-lg text-muted-foreground mb-6">
                            Мы работали месяцами с разными партнёрами по всей стране. У каждого была своя специфика:
                            разная организация отдела продаж, свои требования к документам, уникальная структура воронок,
                            разные уровни дисциплины и контроля менеджеров.
                        </p>
                        <p className="text-lg text-muted-foreground mb-6">
                            Мы видели десятки подходов, перерабатывали их, адаптировали, улучшали, сравнивали эффективность.
                            Результат всех этих лет — <strong className="text-foreground">гибкая, живая CRM-экосистема</strong>.
                        </p>
                        <p className="text-lg text-muted-foreground">
                            <strong className="text-foreground">Это не теоретическая разработка.</strong> Это система,
                            которая выросла из реального опыта, сотни встреч, десятков проектов и тысяч часов практики.
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 text-foreground">
                                            {achievement.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

