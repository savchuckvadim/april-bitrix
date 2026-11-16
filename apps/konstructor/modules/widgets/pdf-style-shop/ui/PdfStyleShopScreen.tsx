'use client';

import { ArrowLeft, Palette } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { Screen, ScreenHeader } from '@/modules/shared';
import { usePdfStyleShop } from '../hooks/use-pdf-style-shop';
import { PdfStyleShopCard } from './PdfStyleShopCard';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-5';

/** Витрина стилей КП в PDF: первая страница каждого стиля, гаммы, выбор для КП */
export const PdfStyleShopScreen = () => {
    const shop = usePdfStyleShop();

    return (
        <Screen width="full" className="gap-4">
            <ScreenHeader
                title="Стили КП в PDF"
                description="Выберите, как будет выглядеть КП: стиль и его гамму. Превью — первая страница на примерных данных."
                actions={
                    <Button variant="ghost" onClick={shop.back}>
                        <ArrowLeft aria-hidden />
                        Назад
                    </Button>
                }
            />
            {shop.loading ? (
                <div className={GRID}>
                    {Array.from({ length: 8 }, (_, index) => (
                        <div key={index} className="aspect-[1/1.5] animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : shop.error ? (
                <p className="text-sm text-destructive">{shop.error}</p>
            ) : shop.cards.length ? (
                <ul className={cn(GRID, 'p-1')} aria-label="Стили КП">
                    {shop.cards.map(card => (
                        <li key={card.template.code} className="min-w-0">
                            <PdfStyleShopCard
                                template={card.template}
                                selected={card.selected}
                                palette={card.palette}
                                palettes={card.palettes}
                                onPick={shop.pick}
                                onPickPalette={shop.pickPalette}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState icon={Palette} title="Стилей нет" description="Список стилей пришёл пустым." />
            )}
        </Screen>
    );
};
