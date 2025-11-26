'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Download, Mail, FileText, CheckCircle2, Loader2 } from 'lucide-react';
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
        description: 'Интерактивные графики, фильтры, возможность настройки показателей "на лету". Все необходимые показатели для руководителей Отделов Продаж Гарант',
    },
    {
        title: 'Автоматизированное рабочее  место',
        description: 'Сделки, Канбаны, Аналитические списки. Автоматическое заполнение полей, онлайн-канбан с актуальной информацией',
    },

    {
        title: 'Встраиваемые приложения',
        description: 'Конструктор документов. Приложение Звонки. Учитывают специфику Гарант. Экономят менеджерам часы работы',
    },
    // {
    //     title: 'Приложение Звонки',
    //     description: 'Специально настроенное приложение для планирования и отчетности по звонкам. Не пропустите ни одной презентации.',
    // },
    // {
    //     title: 'Автоматизация передачи в сервис',
    //     description: 'Автоматическая передача клиентов из Отдела продаж в отдел сервиса Гарант. Полностью настроенные из коробки отчеты и процесс поставки',
    // },
];
const subtitle = `
  Все полностью настроено из коробки. Не нужно ничего дополнительно устанавливать.
  Если в системе будет чего то не хватать именно Вам, мы дополнительно настроим.
  Комплекс решений охватывают все необходимые процессы для менеджеров Гарант. Приложения постоянно обновляются и
  соответствуют актуальным требованиям Гарант. Процессы соответствуют рекомендованным тренерами и менеджерами по обучению продажам НПП Гарант-Сервис
`;
const description = 'Скачайте подробное КП или оставьте заявку — менеджер пришлёт документ';
export const CommercialProposal: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleDownload = () => {
        // Трекинг события
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'download_cp', {
                event_category: 'engagement',
                event_label: 'Commercial Proposal',
            });
        }

        // Скачивание PDF файла
        const link = document.createElement('a');
        link.href = '/offer/offer.pdf';
        link.download = 'commercial-proposal.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRequestByEmail = async () => {
        setIsLoading(true);
        if (!email) {
            alert('Пожалуйста, введите email');
            return;
        }
        // Здесь будет отправка запроса на получение КП по email

        const response = await fetch('/api/mail/send', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            alert('Произошла ошибка при отправке запроса');
            return;
        }
        setIsDialogOpen(false);
        setIsLoading(false);
    };

    return (
        <section id='commercial-proposal' className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl sm:text-4xl font-bold mb-4">
                            Коммерческое предложение
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Полная настройка автоматизации для менеджеров Гарант
                        </CardDescription>
                        {/* <p className="text-muted-foreground mt-4">
                            Скачайте подробное КП или оставьте заявку — менеджер пришлёт документ
                        </p> */}
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
                        <div className='text-center w-full p-5'>
                            <p className='text-xs text-muted-foreground'>
                                {subtitle}
                            </p>
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
                                            disabled={isLoading}
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            {isLoading ? 'Отправка...' : 'Отправить КП'}
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

