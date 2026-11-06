'use client';

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
}

const THUMB_PAGE_WIDTH = 64;
const MAIN_VIEW_PADDING = 24;
const MAX_MAIN_PDF_WIDTH = 1720;
const DEFAULT_MAIN_WIDTH = 720;

export interface PdfPreviewViewerProps {
    /** object URL готового PDF; null — ещё ничего не собрано */
    pdfObjectUrl: string | null;
    busy: boolean;
    /** Что сейчас происходит, пока busy */
    busyLabel?: string;
    error: string | null;
    /** Данные изменились с момента последнего превью */
    stale?: boolean;
    onRefresh: () => void;
    /** Подсказка, когда превью ещё нет */
    emptyHint: ReactNode;
    /** Дополнительная строка в панели управления (например, время рендера) */
    extra?: ReactNode;
}

/**
 * Просмотр PDF: страница по центру, миниатюры справа, листание. Область
 * просмотра постоянной высоты (85% экрана), страница — во всю ширину колонки
 * с прокруткой внутри: размер не скачет от содержимого и текст читается.
 * Не экспортировать из общего баррела `@/modules/shared`: react-pdf трогает
 * DOM при импорте, подключать только через `next/dynamic` с `ssr: false`.
 */
export const PdfPreviewViewer: React.FC<PdfPreviewViewerProps> = ({
    pdfObjectUrl,
    busy,
    busyLabel,
    error,
    stale = false,
    onRefresh,
    emptyHint,
    extra,
}) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [mainWidth, setMainWidth] = useState(DEFAULT_MAIN_WIDTH);
    const mainViewerRef = useRef<HTMLDivElement>(null);
    const thumbRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        setNumPages(null);
        setCurrentPage(1);
        thumbRefs.current.clear();
    }, [pdfObjectUrl]);

    useEffect(() => {
        if (numPages != null && currentPage > numPages) {
            setCurrentPage(numPages);
        }
    }, [numPages, currentPage]);

    useEffect(() => {
        if (!pdfObjectUrl || numPages == null) {
            return;
        }
        const el = mainViewerRef.current;
        if (!el) {
            return;
        }
        const apply = (rect: DOMRectReadOnly) => {
            setMainWidth(Math.max(160, Math.floor(rect.width - MAIN_VIEW_PADDING)));
        };
        apply(el.getBoundingClientRect());
        const ro = new ResizeObserver(entries => {
            const rect = entries[0]?.contentRect;
            if (rect) {
                apply(rect);
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [pdfObjectUrl, numPages]);

    useEffect(() => {
        const node = thumbRefs.current.get(currentPage);
        node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [currentPage]);

    // страница во всю ширину колонки: читаемо, по высоте — прокрутка внутри области
    const mainPageDisplayWidth = useMemo(
        () => Math.floor(Math.min(Math.max(120, mainWidth), MAX_MAIN_PDF_WIDTH)),
        [mainWidth],
    );

    const canPrev = currentPage > 1;
    const canNext = numPages != null && currentPage < numPages;

    const setThumbEl = (pageIndex: number, el: HTMLDivElement | null) => {
        if (el) {
            thumbRefs.current.set(pageIndex, el);
        } else {
            thumbRefs.current.delete(pageIndex);
        }
    };

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <div className="flex shrink-0 flex-wrap items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={busy}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                    Обновить превью
                </Button>
                {!busy && stale && pdfObjectUrl && (
                    <p className="text-sm text-warning">Данные изменились — превью устарело</p>
                )}
                {busy && busyLabel && <p className="text-sm text-muted-foreground">{busyLabel}</p>}
                {!busy && extra}
            </div>

            {error && <p className="shrink-0 text-sm text-destructive">{error}</p>}

            {pdfObjectUrl && !error && (
                <>
                    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Предыдущая страница"
                            disabled={!canPrev || numPages == null}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <p className="min-w-[140px] text-center text-sm text-muted-foreground">
                            {numPages != null ? `Страница ${currentPage} из ${numPages}` : 'Загрузка PDF…'}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Следующая страница"
                            disabled={!canNext}
                            onClick={() => setCurrentPage(p => (numPages != null ? Math.min(numPages, p + 1) : p))}
                        >
                            <ChevronRight className="size-5" />
                        </Button>
                    </div>

                    <div className="flex h-[85vh] min-h-[640px] min-w-0 flex-col overflow-hidden">
                        <Document
                            className="word-template-pdf-preview__document flex min-h-0 flex-1 flex-col overflow-hidden"
                            file={pdfObjectUrl}
                            onLoadSuccess={doc => setNumPages(doc.numPages)}
                            loading={
                                <div className="flex justify-center p-8">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            }
                            error={<p className="p-4 text-destructive">Не удалось открыть PDF</p>}
                        >
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                                {numPages != null ? (
                                    <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-2">
                                        <div
                                            ref={mainViewerRef}
                                            className="box-border min-h-0 min-w-0 flex-1 overflow-auto rounded-md border border-border bg-[#525659] p-3"
                                        >
                                            <div className="flex min-h-full w-full justify-center">
                                                <Page
                                                    pageNumber={currentPage}
                                                    width={mainPageDisplayWidth}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={cn(
                                                'box-border flex min-h-0 w-[84px] shrink-0 flex-col overflow-y-auto overflow-x-hidden',
                                                'rounded-md border border-border bg-muted/60 py-2',
                                            )}
                                        >
                                            {Array.from({ length: numPages }, (_, i) => {
                                                const pageNum = i + 1;
                                                const selected = pageNum === currentPage;
                                                return (
                                                    <div
                                                        key={pageNum}
                                                        ref={(el: HTMLDivElement | null) => setThumbEl(pageNum, el)}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={`Страница ${pageNum}`}
                                                        aria-current={selected ? 'page' : undefined}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                setCurrentPage(pageNum);
                                                            }
                                                        }}
                                                        className={cn(
                                                            'mb-2 cursor-pointer overflow-hidden rounded-md border-2 bg-background transition-colors',
                                                            selected ? 'border-primary' : 'border-transparent',
                                                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                                                        )}
                                                    >
                                                        <Page
                                                            pageNumber={pageNum}
                                                            width={THUMB_PAGE_WIDTH}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                        />
                                                        <div className="py-0.5 text-center text-[0.65rem] leading-tight text-muted-foreground">
                                                            {pageNum}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[200px] flex-1 items-center justify-center">
                                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </Document>
                    </div>
                </>
            )}

            {!pdfObjectUrl && !busy && !error && <p className="text-sm text-muted-foreground">{emptyHint}</p>}
        </div>
    );
};
