'use client';
import { useDeepRouting } from "@/modules/processes";
import { NavigationItem } from "./NavigationItem";

export const Navigation = () => {
    const { isGarant, isPortal, isClient, isMarketplace, isDashboard, isStatistics, isKonstructor, isEvent } = useDeepRouting();


    return (
        <div className="flex flex-row gap-2 h-16 items-center">
            <NavigationItem isActive={isDashboard} href="/entities" title="Dashboard" />
            <NavigationItem isActive={isStatistics} href="/statistics" title="Statistics" />
            <NavigationItem isActive={isMarketplace} href="/marketplace/applications" title="Marketplace" />
            <NavigationItem isActive={isClient} href="/client" title="Client" />
            <NavigationItem isActive={isPortal} href="/portal/list" title="Portal" />
            <NavigationItem isActive={isGarant} href="/garant" title="Garant" />
            <NavigationItem isActive={isKonstructor} href="/konstructor" title="Konstructor" />
            <NavigationItem isActive={isEvent} href="/event" title="Event" />

        </div>
    );
}
