import { ScrollContentWrapper } from '@/modules/shared/ui';
import { StatisticsNavigation } from '@/modules/widgets';
import { PortalNavigation } from '@/modules/widgets/header/portal-navigation/PortalNavigation';

export default function EntitiesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <PortalNavigation />
            <StatisticsNavigation />
            <div className="w-full flex-1 min-h-0 px-3 pt-5 pb-3">
                <main className="h-full min-h-0 w-full max-w-[calc(100vw-200px)] overflow-hidden rounded-xl bg-background">
                    <ScrollContentWrapper>
                        {children}
                    </ScrollContentWrapper>
                </main>
            </div>
        </div>
    );
}

