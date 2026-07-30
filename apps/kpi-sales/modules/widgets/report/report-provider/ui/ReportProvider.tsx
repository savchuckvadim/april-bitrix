'use client';
import type { ReactNode } from 'react';
import { GlassAmbient } from '@workspace/april-ui';
import { NoreportData } from '@/modules/entities/report';
import { Preloader, Processing } from '@/modules/shared';
import { ViewAsBanner } from '@/modules/feature/view-as';
import { ReportHeader } from '../../report-header';
import { ReportFilter } from '../../report-filter';
import { useReportProvider } from '../hooks/use-report-provider';

/**
 * Каркас страниц отчёта: sticky-хедер (не перекрывает контент, в отличие
 * от fixed — контент всегда начинается под ним), фильтры в потоке страницы
 * и состояния загрузки/пустых данных.
 *
 * Полноэкранный Processing ограничен капом (~50с): дальше страница
 * оживает — фильтры доступны (можно сузить период и переотправить),
 * а незавершённая загрузка показывается компактным лоадером в контенте.
 */
export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const {
        mounted,
        isDevProcessingPreview,
        isReportLoading,
        isReportPending,
        hasReportData,
        isFilterOpen,
        setIsFilterOpen,
    } = useReportProvider();

    if (!mounted) {
        return null;
    }

    if (isDevProcessingPreview) {
        return <>{children}</>;
    }

    if (isReportLoading) {
        return (
            <div className="p-7">
                <Processing />
            </div>
        );
    }

    return (
        <div>
            {/* Цветовые пятна под стеклом: без них blur-поверхностям нечего размывать */}
            <GlassAmbient />

            <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm">
                <div className="px-7 py-2">
                    <ReportHeader
                        isFilterOpen={isFilterOpen}
                        setIsFilterOpen={setIsFilterOpen}
                    />
                    {/* Плашка режима «Смотреть как…» (superuser) */}
                    <ViewAsBanner />
                </div>
            </header>

            <div className="px-7 pb-7">
                <ReportFilter isOpen={isFilterOpen} />
                {hasReportData ? (
                    <div>{children}</div>
                ) : isReportPending ? (
                    // Кап процессинга истёк, отчёт ещё считается: страница
                    // живая — можно изменить фильтр и переотправить запрос.
                    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                        <Preloader />
                        <p className="text-sm">
                            Отчёт ещё считается — большой период может
                            занимать время.
                        </p>
                        <p className="text-xs">
                            Можно изменить фильтр и отправить запрос заново —
                            например, сузить период.
                        </p>
                    </div>
                ) : (
                    <NoreportData />
                )}
            </div>
        </div>
    );
};
