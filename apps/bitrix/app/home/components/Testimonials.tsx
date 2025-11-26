'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        name: 'Дмитрий',
        position: 'Директор по продажам',
        company: 'Новосибирск',
        text: 'Помог увеличить продажи на 30% за счет автоматизации и аналитики KPI.',
        result: 'Продажи +30%',
    },
    {
        name: 'Мария ',
        position: 'Коммерческий директор',
        company: 'Иркутск"',
        text: 'Автоматизация сделок и канбан позволили руководителям видеть реальную картину в реальном времени. Теперь мы можем быстро реагировать на изменения.',
        result: 'Выполнение планов по KPI и продажам +50%',
    },
    {
        name: 'Алексей Иванов',
        position: 'Руководитель отдела сервиса',
        company: 'Ростов-на-Дону',
        text: 'Простота интерфейса для менеджеров и автоматическое заполнение данных — это именно то, что нужно. Никто не пропускает клиентов или задачи.',
        result: 'Пропущенных сигналов - 0%',
    },
];

export const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Кейсы и отзывы
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Реальные результаты наших клиентов
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors h-full flex flex-col">
                            <CardContent className="p-6 flex flex-col flex-grow">
                                <Quote className="h-8 w-8 text-primary mb-4" />
                                <p className="text-muted-foreground mb-6 flex-grow">
                                    "{testimonial.text}"
                                </p>
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-primary font-semibold">
                                                {testimonial.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {testimonial.position}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {testimonial.company}
                                    </p>
                                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                        {testimonial.result}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

