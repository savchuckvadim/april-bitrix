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
        <div className="bg-card flex h-dvh w-full overflow-hidden">
            <GlassAmbient />

            {isOpen && (
                <aside className="hidden h-full w-60 shrink-0 flex-col lg:flex">
                    <div className="flex h-14 shrink-0 items-center justify-between px-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            aria-label="Свернуть меню"
                            title="Свернуть меню"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Link href="/" className="font-bold">
                            April <span className="text-primary">CRM</span>
                        </Link>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
                        <Link
                            href="/"
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

            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex h-14 shrink-0 items-center gap-2 px-4">
                    {!isOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            aria-label="Показать меню"
                            title="Показать меню"
                            className="hidden lg:inline-flex"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}

                    <Link href="/" className="shrink-0 font-bold lg:hidden">
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

                <div className="min-h-0 flex-1 px-3 pb-3">
                    <main
                        aria-label={title}
                        /*
                         * Масштабируем только содержимое: шапка и меню должны
                         * остаться на месте — их и так видно.
                         */
                        style={{ zoom: `${zoom.zoom}%` }}
                        className={cn(
                            'bg-background h-full min-h-0 rounded-xl',
                            scroll === 'fixed'
                                ? 'overflow-hidden'
                                : 'overflow-y-auto',
                        )}
                    >
                        {children}

                        {/*
                         * Футер сайта, а не своя копия: телефон, почта и
                         * юридические ссылки должны быть теми же самыми.
                         * Отдельная копия рано или поздно разойдётся с
                         * оригиналом, и разойдётся молча.
                         *
                         * В нескроллящемся режиме его нет — там до низа
                         * страницы просто не доехать.
                         */}
                        {scroll === 'island' && <Footer />}
                    </main>
                </div>
            </div>
        </div>
    );
};
