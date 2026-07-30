'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { List, Calendar, FileText, Building2 } from 'lucide-react';

const lists = [
    {
        icon: List,
        title: 'KPI',
        description: 'Фиксирует конкретный набор событий с возможностью фильтрации по различным параметрам',
    },
    {
        icon: Calendar,
        title: 'История',
        description: 'Хронология всех взаимодействий с клиентами и компаниями',
    },
    {
        icon: FileText,
        title: 'Презентации',
        description: 'Учет и отслеживание всех проведенных презентаций',
    },
];

export const ListsBlock: React.FC = () => {
    return (
        <section className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Списки: KPI, История, Презентации
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        В системе автоматически формируются списки, которые используются в отчётах и карточках компаний.
                        Каждое событие содержит дату, статус, вид события, комментарии менеджера и связь с компанией и сделками.
                    </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {lists.map((list, index) => {
                        const Icon = list.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">{list.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{list.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Example event card */}
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Building2 className="h-6 w-6 text-primary" />
                            <CardTitle>Пример события в списке</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-foreground">Дата:</span>
                                <p className="text-muted-foreground">15.01.2025</p>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Статус:</span>
                                <p className="text-muted-foreground">Презентация проведена</p>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Вид события:</span>
                                <p className="text-muted-foreground">Презентация</p>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Компания:</span>
                                <p className="text-muted-foreground">ООО "Пример"</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <span className="font-semibold text-foreground">Комментарий менеджера:</span>
                            <p className="text-muted-foreground mt-1">
                                Клиент заинтересован в продукте, запросил коммерческое предложение
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

