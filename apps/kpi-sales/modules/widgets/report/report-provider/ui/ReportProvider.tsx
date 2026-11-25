'use client';
import { Suspense, type ReactNode } from 'react';
import { GlassAmbient } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { NoreportData } from '@/modules/entities/report';
import {
    PAGE_BODY_CLASS,
    PAGE_HEADER_PAD_CLASS,
    Preloader,
    Processing,
} from '@/modules/shared';
import { ViewAsBanner } from '@/modules/feature/view-as';
// Прямой путь (не барель вкладок): каркас стоит в корневом layout.
import { ReportTypeUrlSync } from '@/modules/feature/report-widget-type/ui/ReportTypeUrlSync';
import { ReportHeader } from '../../report-header';
import { ReportFilter } from '../../report-filter';
import { useReportProvider } from '../hooks/use-report-provider';

/**
 * Каркас страниц отчёта: sticky-хедер (не перекрывает контент, в отличие
 * от fixed — контент всегда начинается под ним), панель фильтров ВНУТРИ
 * хедера под его строкой и состояния загрузки/пустых данных.
 *
 * Панель фильтров лежит в sticky-хедере, а не в потоке страницы: «Показать
 * фильтры» после прокрутки вниз раскрывает её прямо под строкой хедера, в
 * видимой части окна (внутри iframe Битрикса прокрутка к панели ненадёжна).
 * Хедер — колонка не выше окна: строка кнопок остаётся целиком, а панель
 * занимает остаток и прокручивается сама. Пока панель открыта, хедер
 * непрозрачный; закрытая — прежнее полупрозрачное стекло.
 *
 * Полноэкранный Processing ограничен капом (~50с): дальше страница
 * оживает — фильтры доступны (можно сузить период и переотправить),
 * а незавершённая загрузка показывается компактным лоадером в контенте.
 *
 * Страницу держит под заставкой только главный источник текущей вкладки
 * (см. useReportProvider): у вкладок без событий и звонков («Дайджест»,
 * «Финансы», «AI аналитика») заставки и «нет данных» нет вовсе.
 *
 * Ссылка `?tab=` применяется отсюда, а не из тела отчёта: тело не
 * рисуется под заставкой, и ссылка на вкладку без событий ждала бы события
 * вкладки по умолчанию. Один и тот же элемент стоит первым во всех
 * ветках — переход «заставка ↔ страница» его не перемонтирует, и уже
 * применённое значение ссылки не навязывается повторно.
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

    // `?tab=` — ссылка сразу на вкладку отчёта (напр. дайджест); useSearchParams
    // требует Suspense.
    const urlSync = (
        <Suspense fallback={null}>
            <ReportTypeUrlSync />
        </Suspense>
    );

    if (isReportLoading) {
        return (
            <>
                {urlSync}
                <div className="p-7">
                    <Processing />
                </div>
            </>
        );
    }

    return (
        <>
            {urlSync}
            <div>
                {/* Цветовые пятна под стеклом: без них blur-поверхностям нечего размывать */}
                <GlassAmbient />

                <header
                    className={cn(
                        'sticky top-0 z-10 flex max-h-dvh flex-col',
                        isFilterOpen
                            ? 'bg-background shadow-md'
                            : 'bg-background/50 backdrop-blur-sm',
                    )}
                >
                    <div className={cn('shrink-0', PAGE_HEADER_PAD_CLASS)}>
                        <ReportHeader
                            isFilterOpen={isFilterOpen}
                            setIsFilterOpen={setIsFilterOpen}
                        />
                        {/* Плашка режима «Смотреть как…» (superuser) */}
                        <ViewAsBanner />
                    </div>
                    <ReportFilter isOpen={isFilterOpen} />
                </header>

                <div className={PAGE_BODY_CLASS}>
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
        </>
    );
};
