'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Download, FileText, CheckCircle2, Zap, Settings, BarChart3, Phone, Users } from 'lucide-react';

const offerData = {
    title: 'Полная настройка автоматизации отдела продаж на базе Битрикс24 для Партнеров Гарант',
    intro: 'Мы проводим комплексную настройку CRM, включая интеграцию с различными системами, чтобы упростить работу менеджеров и обеспечить сбор аналитики по отделу продаж. Основная цель проекта – предоставить удобный интерфейс для планирования звонков и создания документов, а также предоставить руководству доступ к аналитике, позволяющей оперативно реагировать на изменения в ключевых показателях эффективности (KPI).',
    sections: [
        {
            title: 'Отчет KPI',
            icon: BarChart3,
            content: 'Руководители смогут получать сводный отчет по KPI, где ключевые показатели представлены в виде числовых данных по каждому менеджеру за выбранный период. Например, можно увидеть, сколько презентаций было проведено за указанный промежуток времени.',
            details: 'Отчет выполнен в виде отдельного приложения, интегрируемого в Битрикс, с интуитивно понятным и современным интерфейсом. В нем представлены интерактивные и эстетичные графики, удобные фильтры, а также возможность гибкой настройки — можно легко убирать или добавлять показатели "на лету", адаптируя отчет под нужды конкретного анализа.',
        },
        {
            title: 'Сделки',
            icon: Settings,
            content: 'Мы настраиваем систему таким образом, что менеджеры могут легко планировать звонки, а вся информация по Сделкам и Компаниям (статусы, результативность, стадии, специальные поля с датами, сотрудниками и типами) заполняется автоматически.',
            details: 'Это позволяет менеджерам не отвлекаться на детали, а для руководства формируется онлайн-канбан с актуальной информацией о деятельности отдела. Руководитель в реальном времени видит, на каком этапе находятся клиенты — горячие, холодные, в процессе принятия решения, — какие предложения и счета выставлены, а также распределение компаний и задач по сотрудникам.',
        },
        {
            title: 'Списки',
            icon: FileText,
            content: 'В системе, помимо сделок и компаний, автоматически формируются списки, такие как: KPI, История, Презентации.',
            details: 'Каждый список представляет собой структурированный набор данных событиях. Например, отчет по KPI основывается на данных из этих списков, что позволяет не только просматривать, но и при необходимости редактировать детали показателей. Доступ к этим спискам можно получить как напрямую, так и через карточку Компании или Сделки, обеспечивая удобство и гибкость управления информацией.',
        },
        {
            title: 'Менеджеры',
            icon: Users,
            content: 'Чтобы обеспечить работу всей аналитики, автоматическое открытие, заполнение и закрытие сделок, а также обновление канбанов и отчетов, менеджерам достаточно использовать интерактивный и удобный интерфейс "Звонки", разработанный специально для специалистов по продажам "Гарант".',
            details: 'Эта форма для отчетности и планирования легко встраивается прямо в карточку компании или звонка, позволяя менеджерам эффективно планировать свою работу без необходимости вручную заполнять многочисленные данные.',
        },
    ],
    additional: 'Помимо этого, в системе доступен Конструктор коммерческих предложений, который интегрируется с основной системой. Он помогает менеджерам быстро и удобно создавать коммерческие предложения, счета и договоры, а руководителям — отслеживать ключевые показатели эффективности (KPI) и контролировать процесс работы с документами.',
    conclusion: 'Благодаря такому подходу, работа менеджеров становится проще и эффективнее, а руководители получают полную и достоверную аналитику.',
    pricing: [
        {
            title: 'Настройка',
            type: 'Разовая услуга',
            duration: '1-2 месяца',
            includes: [
                'Создание и настройка воронок сделок',
                'Настройка полей в Сделках и Компаниях',
                'Разработка списков и смарт-процессов',
                'Настройка дополнительных бизнес-процессов',
                'Подключение к приложениям',
                'Адаптация и тестирование системы',
                'Сопровождение на период адаптации',
            ],
            prices: [
                { label: 'По прайсу', amount: '150,000 ₽' },
                { label: 'Специальное предложение', amount: '85,000 ₽', highlight: true },
                { label: 'При покупке Битрикс у нас', amount: '50,000 ₽', highlight: true },
            ],
        },
        {
            title: 'Интеграции',
            type: 'Ежемесячная услуга',
            includes: [
                'Отчет KPI',
                'Звонки',
                'Конструктор документов',
                'Базовое обучение и поддержка',
            ],
            prices: [
                { label: 'По прайсу', amount: '7,000 ₽/мес' },
                { label: 'Специальное предложение', amount: '5,500 ₽/мес', highlight: true },
                { label: 'При покупке Битрикс у нас', amount: '4,200 ₽/мес', highlight: true },
            ],
        },
        {
            title: 'Персональный менеджер',
            type: 'Ежемесячная услуга',
            includes: [
                'Обучение новых сотрудников',
                'Донастройка',
                'Консультации',
            ],
            prices: [
                { label: 'По прайсу', amount: '10,000 ₽/мес' },
            ],
        },
    ],
    bonuses: [
        'Доработки функционала часто выполняются в рамках поддержки без дополнительной оплаты',
        'При внедрении приложение можно адаптировать под ваши потребности и добавить нужные функции',
        'В разумных пределах мы стараемся реализовать это без дополнительных затрат',
        'Для клиентов по Битрикс предусмотрены специальные ценовые условия и поддержка через чат Битрикс',
        'В качестве бонуса вы получите дополнительную полностью автоматизированную воронку-канбан по презентациям',
    ],
};

export const OfferContent: React.FC = () => {
    const handleDownloadPDF = async () => {
        // Используем window.print() для генерации PDF через браузер
        // Пользователь может сохранить как PDF через диалог печати
        window.print();
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 pt-25">
            {/* Header */}
            <div className="text-center mb-12 mt-20">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <FileText className="h-12 w-12 text-primary" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                        Коммерческое предложение
                    </h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                    {offerData.title}
                </p>
                <Button
                    size="lg"
                    onClick={handleDownloadPDF}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 no-print"
                >
                    <Download className="mr-2 h-5 w-5" />
                    Скачать PDF
                </Button>
            </div>

            {/* Intro */}
            <Card className="mb-8 border-2">
                <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {offerData.intro}
                    </p>
                </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-8 mb-12">
                {offerData.sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed">
                                    {section.content}
                                </p>
                                {section.details && (
                                    <p className="text-muted-foreground leading-relaxed">
                                        {section.details}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Additional Info */}
            <Card className="mb-12 border-2 border-primary/20">
                <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                        {offerData.additional}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                        {offerData.conclusion}
                    </p>
                </CardContent>
            </Card>

            {/* Pricing */}
            <div className="space-y-8 mb-12">
                <h2 className="text-3xl font-bold text-foreground text-center mb-8">
                    Стоимость услуг
                </h2>
                {offerData.pricing.map((pkg, index) => (
                    <Card key={index} className="border-2">
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{pkg.title}</CardTitle>
                                    <p className="text-muted-foreground">
                                        {pkg.type}
                                        {pkg.duration && ` • ${pkg.duration}`}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {pkg.includes && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-3">
                                        Включает:
                                    </h4>
                                    <ul className="space-y-2">
                                        {pkg.includes.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold text-foreground mb-3">Цена:</h4>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {pkg.prices.map((price, priceIndex) => (
                                        <div
                                            key={priceIndex}
                                            className={`p-4 rounded-lg border-2 ${price.highlight
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted'
                                                }`}
                                        >
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {price.label}
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${price.highlight ? 'text-primary' : 'text-foreground'
                                                    }`}
                                            >
                                                {price.amount}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bonuses */}
            <Card className="mb-12 border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary" />
                        Дополнительные преимущества
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {offerData.bonuses.map((bonus, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{bonus}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border-2 border-primary shadow-lg">
                <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                        Готовы начать?
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6">
                        Свяжитесь с нами для обсуждения деталей и получения индивидуального предложения
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
                        <Button
                            size="lg"
                            onClick={() => {
                                const element = document.querySelector('#contact');
                                if (element) {
                                    window.location.href = '/home#contact';
                                }
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Связаться с нами
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleDownloadPDF}
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Скачать PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

