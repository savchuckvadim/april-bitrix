'use client';

import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu } from 'lucide-react';
import { GlassAmbient } from '@workspace/april-ui';
import { Footer } from '@/app/(site)/home/components/Footer';
import { ThemeToggler } from '@workspace/theme';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useContentZoom } from '../hooks/use-content-zoom';
import { useForcedGlass } from '../hooks/use-forced-glass';
import { useProcessSidebar } from '../hooks/use-process-sidebar';
import { ProcessTabs } from './ProcessTabs';
import { ProcessTabsMobile } from './ProcessTabsMobile';
import { ZoomControls } from './ZoomControls';

interface ProcessShellProps {
    eyebrow: string;
    title: string;
    /**
     * Как ведёт себя контентный «остров»:
     * island — обычная прокрутка внутри острова;
     * fixed  — остров занимает всю высоту и не прокручивается (вид «компакт»).
     */
    scroll?: 'island' | 'fixed';
    children: ReactNode;
}

/**
 * CRM-рама процесса. Взята из `leads-process`, но с переписанным контрактом
 * раскладки: остров умеет быть нескроллящейся сеткой во всю высоту — этого
 * требует вид «Хребет и доска».
 */
export const ProcessShell: FC<ProcessShellProps> = ({
    eyebrow,
    title,
    scroll = 'island',
    children,
}) => {
    const { isOpen, toggle } = useProcessSidebar();

    useForcedGlass();

    const zoom = useContentZoom();

    return (
        /*
         * Страница, а не приложение с фиксированной рамой. Прокручивается
         * документ целиком, поэтому футер оказывается ПОД всем — и под
         * сайдбаром, и под островом, как и положено подвалу.
         *
         * Сайдбар и шапка держатся на sticky: остаются на месте, но не режут
         * страницу на два независимых скролла.
         */
        <div
            className={cn(
                'bg-card flex w-full flex-col',
                scroll === 'fixed' ? 'h-dvh overflow-hidden' : 'min-h-dvh',
            )}
        >
            <GlassAmbient />

            <div className="flex min-h-0 w-full flex-1">
                {isOpen && (
                    <aside
                        className={cn(
                            'hidden w-60 shrink-0 flex-col lg:flex',
                            scroll === 'fixed'
                                ? 'h-full'
                                : 'sticky top-0 h-dvh self-start',
                        )}
                    >
                        <div className="flex h-14 shrink-0 items-center justify-start px-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggle}
                                aria-label="Свернуть меню"
                                title="Свернуть меню"
                            >
                                <Menu className="h-7 w-7" />
                            </Button>
                            <Link href="/" className="font-bold">
                                April <span className="text-primary">CRM</span>
                            </Link>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
                            <Link
                                href="/process/sales"
                                className="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Все разделы
                            </Link>

                            <div>
                                <p className="text-muted-foreground px-2 pb-1.5 text-xs font-bold tracking-widest uppercase">
                                    Процесс продажи
                                </p>
                                <ProcessTabs />
                            </div>
                        </div>
                    </aside>
                )}

                <div
                    className={cn(
                        'flex min-w-0 flex-1 flex-col',
                        scroll === 'fixed' ? 'h-full overflow-hidden' : '',
                    )}
                >
                    <div className="bg-card/80 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 px-1 backdrop-blur">
                        {!isOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggle}
                                aria-label="Показать меню"
                                title="Показать меню"
                                className="hidden lg:inline-flex"
                            >
                                <Menu size={16} />
                            </Button>
                        )}

                        <Link href="/" className="shrink-0 font-bold lg:hidden ml-2">
                            April <span className="text-primary">CRM</span>
                        </Link>

                        <p className="text-muted-foreground hidden truncate text-sm font-semibold lg:block">
                            {eyebrow}
                        </p>

                        {/*
                         * Переключателя стекла здесь намеренно нет: страница
                         * показывает продукт, а не настраивает его вид. Стекло
                         * включено всегда — система сама погасит его при
                         * prefers-reduced-transparency.
                         */}
                        <div className="text-muted-foreground ml-auto hidden items-center gap-3 text-xs lg:flex">
                            <ZoomControls
                                zoom={zoom.zoom}
                                canZoomIn={zoom.canZoomIn}
                                canZoomOut={zoom.canZoomOut}
                                onZoomIn={zoom.zoomIn}
                                onZoomOut={zoom.zoomOut}
                                onReset={zoom.reset}
                            />
                            <ThemeToggler />
                        </div>
                    </div>

                    <ProcessTabsMobile />

                    <div
                        className={cn(
                            'flex min-h-0 flex-1 flex-col px-3 pb-3',
                            scroll === 'fixed' && 'overflow-hidden',
                        )}
                    >
                        <main
                            aria-label={title}
                            /*
                             * Масштабируем только содержимое: шапка и меню должны
                             * остаться на месте — их и так видно.
                             */
                            style={{ zoom: `${zoom.zoom}%` }}
                            className={cn(
                                'bg-background rounded-xl',
                                scroll === 'fixed'
                                    ? 'h-full min-h-0 overflow-hidden'
                                    : 'flex-1',
                            )}
                        >
                            {children}
                        </main>
                    </div>
                </div>
            </div>

            {/*
             * Футер сайта, а не своя копия: телефон, почта и юридические
             * ссылки должны быть теми же самыми. Отдельная копия рано или
             * поздно разойдётся с оригиналом, и разойдётся молча.
             *
             * Стоит вне рамы: тянется во всю ширину, под сайдбаром и под
             * островом. Внутри острова он читался как ещё одна карточка.
             */}
            {scroll === 'island' && <Footer />}
        </div>
    );
};
