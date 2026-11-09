import type { Metadata } from 'next';
import { BenefitCards } from './components/BenefitCards';
import { DemoRequestSection } from './components/DemoRequestSection';
import { FaqList } from './components/FaqList';
import { HubAiSection } from './components/HubAiSection';
import { HubBonusSite } from './components/HubBonusSite';
import { HubHero } from './components/HubHero';
import { PlatformSection } from './components/PlatformSection';
import { RoleColumns } from './components/RoleColumns';
import { ServiceGrid } from './components/ServiceGrid';
import { ShotFrame } from './components/ShotFrame';
import { StepCards } from './components/StepCards';
import {
    HUB_FAQ,
    HUB_FAQ_SECTION,
    HUB_LAUNCH_SECTION,
    HUB_LAUNCH_STEPS,
    HUB_OVERVIEW_SECTION,
    HUB_OVERVIEW_SHOT,
    HUB_ROLES,
    HUB_ROLES_SECTION,
    HUB_SERVICES_SECTION,
    HUB_SUPPORT,
    HUB_SUPPORT_SECTION,
} from './model/hub';
import { PLATFORM_ANCHORS, PLATFORM_ROOT } from './model/navigation';
import { PLATFORM_SERVICES } from './model/services';
import { isShotVisible } from './lib/shot-visibility';

const TITLE = 'Апрель — встройки в Битрикс24 для отделов продаж партнёров ГАРАНТ';
const DESCRIPTION =
    'Звонки, конструктор КП и договоров, KPI-отчёт, обработка заявок и AI-разбор звонков. Сделки, задачи и отчёты обновляются сами, руководитель видит, где отдел недобирает продажи.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PLATFORM_ROOT },
    openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
};

/** Главная продающего раздела: обзор выгод и сервисов, путь к заявке на демо. */
export default function PlatformPage() {
    return (
        <>
            <HubHero />
            <PlatformSection {...HUB_ROLES_SECTION}>
                <RoleColumns roles={HUB_ROLES} />
            </PlatformSection>
            <PlatformSection id={PLATFORM_ANCHORS.services} tone="muted" {...HUB_SERVICES_SECTION}>
                <ServiceGrid services={PLATFORM_SERVICES} />
            </PlatformSection>
            {isShotVisible(HUB_OVERVIEW_SHOT) && (
                <PlatformSection {...HUB_OVERVIEW_SECTION}>
                    <ShotFrame shotId={HUB_OVERVIEW_SHOT} />
                </PlatformSection>
            )}
            <HubAiSection />
            <PlatformSection id={PLATFORM_ANCHORS.launch} {...HUB_LAUNCH_SECTION}>
                <StepCards items={HUB_LAUNCH_STEPS} />
            </PlatformSection>
            <PlatformSection tone="muted" {...HUB_SUPPORT_SECTION}>
                <BenefitCards items={HUB_SUPPORT} />
            </PlatformSection>
            <HubBonusSite />
            <PlatformSection id={PLATFORM_ANCHORS.faq} {...HUB_FAQ_SECTION}>
                <FaqList items={HUB_FAQ} />
            </PlatformSection>
            <DemoRequestSection />
        </>
    );
}
