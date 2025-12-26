import React from 'react';
import { Header } from './components/Header';
import { HeroWithVideo } from './components/HeroWithVideo';
import { Hero2 } from './components/Hero2';
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
import { App } from '@/modules/app';



export default function HomePage() {
    return (
        <App isInstall={false} >
            <div className="min-h-screen flex flex-col scrollbar-hide">
                <Header />
                <main className="flex-grow">
                    {/* 1. Hero-блок */}
                    <Hero2 />

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
        </App>
    );
}

