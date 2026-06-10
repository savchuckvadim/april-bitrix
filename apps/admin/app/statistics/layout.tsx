import { ScrollContentWrapper } from '@/modules/shared/ui';
import { StatisticsNavigation } from '@/modules/widgets';

export default function EntitiesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <StatisticsNavigation />
            <main className="h-[calc(100dvh-96px)] min-h-0 max-w-[calc(100vw-200px)] mx-auto flex-1 overflow-hidden rounded-xl bg-background m-3 mt-5 mb-3">
                <ScrollContentWrapper>
                    {children}
                </ScrollContentWrapper>
            </main>
        </>
    );
}

