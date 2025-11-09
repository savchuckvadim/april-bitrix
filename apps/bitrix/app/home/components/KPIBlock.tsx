'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { BarChart3, Eye } from 'lucide-react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';

export const KPIBlock: React.FC = () => {
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    return (
        <section id="kpi" className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Content */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="h-8 w-8 text-primary" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                                Отчет KPI — обзор работы менеджеров
                            </h2>
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">
                            Руководители смогут получать сводный отчет по KPI, где ключевые показатели
                            представлены в виде числовых данных по каждому менеджеру за выбранный период.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    Интерактивные и эстетичные графики с удобными фильтрами
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    Гибкая настройка — можно легко убирать или добавлять показатели "на лету"
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    Интуитивно понятный и современный интерфейс
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    Адаптация отчета под нужды конкретного анализа
                                </span>
                            </li>
                        </ul>
                        <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Eye className="mr-2 h-5 w-5" />
                                    Посмотреть demo отчета
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Демо отчета KPI</DialogTitle>
                                    <DialogDescription>
                                        Интерактивный отчет с графиками и фильтрами
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                    <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        Здесь будет демо-версия отчета KPI
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <Card className="border-2 shadow-xl">
                            <CardContent className="p-0">
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <Image
                                        src="/feat.jpg"
                                        alt="Скриншот отчета KPI с интерактивными графиками"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

