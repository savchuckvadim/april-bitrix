'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Download, Mail, FileText, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

const proposalPoints = [
    {
        title: 'Отчет KPI',
        description: 'Интерактивные графики, фильтры, возможность настройки показателей "на лету"',
    },
    {
        title: 'Сделки',
        description: 'Автоматическое заполнение полей, онлайн-канбан с актуальной информацией',
    },
    {
        title: 'Списки',
        description: 'KPI, История, Презентации — как источники данных для отчетов и карточек компаний',
    },
];

export const CommercialProposal: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDownload = () => {
        // Здесь будет логика скачивания PDF
        // Пока просто трекинг события
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'download_cp', {
                event_category: 'engagement',
                event_label: 'Commercial Proposal',
            });
        }
        // В реальности здесь будет ссылка на PDF файл
        alert('Скачивание КП будет доступно после добавления PDF файла');
    };

    const handleRequestByEmail = () => {
        if (!email) {
            alert('Пожалуйста, введите email');
            return;
        }
        // Здесь будет отправка запроса на получение КП по email
        setIsDialogOpen(false);
        alert('КП будет отправлено на указанный email');
    };

    return (
        <section className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl sm:text-4xl font-bold mb-4">
                            Коммерческое предложение
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Полная настройка автоматизации под ваш бизнес
                        </CardDescription>
                        <p className="text-muted-foreground mt-4">
                            Скачайте подробное КП или оставьте заявку — менеджер пришлёт документ
                        </p>
                    </CardHeader>
                    <CardContent>
                        {/* Краткие тезисы КП */}
                        <div className="grid sm:grid-cols-3 gap-6 mb-8">
                            {proposalPoints.map((point, index) => (
                                <div key={index} className="flex gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {point.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {point.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={handleDownload}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Скачать PDF КП
                            </Button>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                    >
                                        <Mail className="mr-2 h-5 w-5" />
                                        Заказать КП на почту
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Получить КП на email</DialogTitle>
                                        <DialogDescription>
                                            Укажите ваш email, и мы отправим коммерческое предложение
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleRequestByEmail}
                                            className="w-full"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Отправить КП
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

