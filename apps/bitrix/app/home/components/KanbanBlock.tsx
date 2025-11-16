'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export const KanbanBlock: React.FC = () => {
    return (
        <section id="deals" className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Visual */}
                    <div className="relative order-2 lg:order-1">
                        <Card className="border-2 shadow-xl">
                            <CardContent className="p-0">
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <Image
                                        src="/demo/kanban_presentation.png"
                                        alt="Онлайн-канбан сделок с автоматическим заполнением"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                            Сделки — всё автоматизировано
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Наши сотрудники не ведут Сделки вручную. Мы настраиваем систему таким образом,
                            что менеджеры могут легко планировать звонки, а вся информация по Сделкам и
                            Компаниям заполняется автоматически.
                        </p>
                        <ul className="space-y-4 mb-6">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-foreground">Автоматическое заполнение полей</span>
                                    <p className="text-muted-foreground text-sm">
                                        Статусы, результативность, стадии, специальные поля с датами, сотрудниками и типами
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-foreground">Онлайн-канбан в реальном времени</span>
                                    <p className="text-muted-foreground text-sm">
                                        Руководитель видит, на каком этапе находятся клиенты — горячие, холодные, в процессе принятия решения
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-foreground">Автоматизированный инструмент "Холодный обзвон"</span>
                                    <p className="text-muted-foreground text-sm">
                                        Отфильтрованные списки компаний легко перемещаются в воронки продаж
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

