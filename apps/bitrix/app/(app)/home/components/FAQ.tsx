'use client'
import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';

const faqs = [
    {
        question: 'Какие сроки внедрения?',
        answer: 'Стандартное внедрение занимает 2-4 недели. Сроки зависят от сложности бизнес-процессов и количества необходимых интеграций.',
    },
    {
        question: 'Можно ли перенести данные из существующей CRM?',
        answer: 'Да, мы можем перенести данные из большинства популярных CRM систем. Процесс миграции включается в пакет услуг.',
    },
    {
        question: 'Какие интеграции доступны?',
        answer: 'Мы интегрируемся с телефонией, почтой, мессенджерами, системами учета и другими необходимыми для вашего бизнеса системами.',
    },
    {
        question: 'Нужно ли обучение менеджеров?',
        answer: 'Да, мы проводим обучение вашей команды работе с системой. Обучение включено в пакет услуг и адаптировано под ваши процессы.',
    },
    {
        question: 'Какая поддержка предоставляется?',
        answer: 'Мы предоставляем техническую поддержку в течение всего срока действия договора. В пакете "Премиум" доступна приоритетная поддержка.',
    },
    {
        question: 'Можно ли кастомизировать интерфейс?',
        answer: 'Да, мы настраиваем интерфейсы под специфику вашего бизнеса и требования менеджеров. Все интерфейсы адаптируются под ваши процессы.',
    },
    {
        question: 'Как происходит оплата?',
        answer: 'Оплата производится поэтапно: предоплата при начале работ, оплата по завершении настройки и финальная оплата после обучения и запуска.',
    },
    {
        question: 'Что делать, если нужны дополнительные функции?',
        answer: 'Мы можем добавить дополнительные функции и автоматизации в рамках технической поддержки или как отдельный проект развития.',
    },
];

export const FAQ: React.FC = () => {
    return (
        <section className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Часто задаваемые вопросы
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Ответы на популярные вопросы о наших услугах
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

