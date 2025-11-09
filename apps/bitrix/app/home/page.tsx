import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CommercialProposal } from './components/CommercialProposal';
import { KPIBlock } from './components/KPIBlock';
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
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Hero />
                <Features />
                <div id="commercial-proposal">
                    <CommercialProposal />
                </div>
                <KPIBlock />
                <KanbanBlock />
                <ListsBlock />
                <HowItWorks />
                <Testimonials />
                <Pricing />
                <FAQ />
                <LeadForm />
            </main>
            <Footer />
        </div>
    );
}

