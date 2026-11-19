'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { MicroSelect } from '../fields/MicroSelect';
import { PAGER_DEFAULT_SIZES, pagerView } from './pager.util';

export interface PagerProps {
    /** Текущая страница, с 1. */
    page: number;
    pageSize: number;
    /** Всего строк под фильтры (на всех страницах). */
    total: number;
    /** Идёт загрузка страницы — кнопки ждут. */
    loading?: boolean;
    onPageChange: (page: number) => void;
    /** Смена размера страницы; не задан — выбора размера нет. */
    onPageSizeChange?: (pageSize: number) => void;
    /** Варианты размера страницы; по умолчанию 25, 50, 100. */
    pageSizes?: readonly number[];
    className?: string;
}

const numberRu = (value: number): string => value.toLocaleString('ru-RU');

/**
 * Переключатель страниц серверного списка: «назад», «вперёд», где мы
 * («Страница 2 из 6 · строки 26–50 из 134») и сколько строк на странице.
 * Страницы считает сервер — сюда приходят только номер, размер и общее число.
 * Маршрутов компонент не знает: переход делает вызывающий.
 */
export const Pager = ({
    page,
    pageSize,
    total,
    loading = false,
    onPageChange,
    onPageSizeChange,
    pageSizes = PAGER_DEFAULT_SIZES,
    className,
}: PagerProps) => {
    const view = pagerView(page, pageSize, total);
    const rows =
        view.from === 0
            ? 'строк нет'
            : `строки ${numberRu(view.from)}–${numberRu(view.to)} из ${numberRu(total)}`;

    return (
        <nav
            aria-label="Страницы списка"
            className={cn(
                'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm',
                className,
            )}
        >
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || !view.hasPrev}
                    onClick={() => onPageChange(view.page - 1)}
                >
                    <ChevronLeft aria-hidden />
                    Назад
                </Button>
                <span className="text-muted-foreground tabular-nums">
                    Страница {numberRu(view.page)} из {numberRu(view.pages)} ·{' '}
                    {rows}
                    {loading ? ' · загружаем…' : ''}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading || !view.hasNext}
                    onClick={() => onPageChange(view.page + 1)}
                >
                    Вперёд
                    <ChevronRight aria-hidden />
                </Button>
            </div>
            {onPageSizeChange && (
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    Строк на странице
                    <MicroSelect
                        ariaLabel="Строк на странице"
                        value={String(pageSize)}
                        options={pageSizes.map(size => ({
                            value: String(size),
                            label: String(size),
                        }))}
                        disabled={loading}
                        onChange={value => onPageSizeChange(Number(value))}
                    />
                </label>
            )}
        </nav>
    );
};
