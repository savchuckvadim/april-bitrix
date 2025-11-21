import React from 'react';
import { Header } from './components/Header';
import { HeroWithVideo } from './components/HeroWithVideo';
import { ProblemBlock } from './components/ProblemBlock';
import { SolutionBlock } from './components/SolutionBlock';
import { ManagerBenefits } from './components/ManagerBenefits';
import { DocumentBuilder } from './components/DocumentBuilder';
import { CallsBlock } from './components/CallsBlock';
import { KPIBlock } from './components/KPIBlock';
import { ServiceTransfer } from './components/ServiceTransfer';
import { ComparisonBlock } from './components/ComparisonBlock';
import { AboutUs } from './components/AboutUs';
import { TargetAudience } from './components/TargetAudience';
import { CommercialProposal } from './components/CommercialProposal';
import { KanbanBlock } from './components/KanbanBlock';
import { ListsBlock } from './components/ListsBlock';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { LeadForm } from './components/LeadForm';
import { Footer } from './components/Footer';

export const metadata = {
    title: 'April CRM — Полная настройка CRM (Битрикс) под ключ',
    description:
        'Комплексная настройка CRM (Битрикс) под ключ для отделов продаж и сервиса. Автоматизация сделок, звонков, отчетности и KPI. Запуск за 2-4 недели.',
    keywords: [
        'CRM Битрикс',
        'настройка CRM под ключ',
        'автоматизация продаж',
        'KPI отчеты',
        'канбан сделок',
        'внедрение CRM',
    ],
    openGraph: {
        title: 'April CRM — Полная настройка CRM (Битрикс) под ключ',
        description:
            'Комплексная настройка CRM (Битрикс) под ключ для отделов продаж и сервиса. Запуск за 2-4 недели.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'April CRM — Полная настройка CRM (Битрикс) под ключ',
        description:
            'Комплексная настройка CRM (Битрикс) под ключ для отделов продаж и сервиса. Запуск за 2-4 недели.',
    },
};

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col scrollbar-hide">
            <Header />
            <main className="flex-grow">
                {/* 1. Hero-блок */}
                <HeroWithVideo />

                {/* 2. Проблема / Боль рынка */}
                <ProblemBlock />

                {/* 3. Наше решение */}
                <SolutionBlock />


                {/* 4. Что получает менеджер */}
                <ManagerBenefits />

                {/* 5. Умный конструктор документов */}
                <DocumentBuilder />

                {/* 5.1. Звонки — учет звонков и презентаций */}
                <CallsBlock />

                {/* 6. Блок для руководителей / директоров */}
                <KPIBlock />

                {/* 7. Автоматизированная передача в сервис */}
                <ServiceTransfer />

                {/* 8. Почему это выгоднее внедрений */}
                <ComparisonBlock />



                {/* 10. Для кого подходит */}
                <TargetAudience />

                {/* Дополнительные блоки */}
                <KanbanBlock />
                <ListsBlock />

                {/* 9. О нас */}
                <AboutUs />


                <HowItWorks />

                <CommercialProposal />


                <Testimonials />
                {/* <Pricing /> */}
                {/* <FAQ /> */}
                <LeadForm />
            </main>
            <Footer />
        </div>
    );
}

