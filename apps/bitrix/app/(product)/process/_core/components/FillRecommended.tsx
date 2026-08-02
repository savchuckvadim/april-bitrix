'use client';

import type { FC } from 'react';
import { RotateCcw, Wand2 } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';

interface FillRecommendedProps {
    /** Название схемы, которую поставит кнопка. */
    presetLabel: string;
    /** Сколько вопросов ещё без ответа. */
    unanswered: number;
    onApply: () => void;
    onReset: () => void;
}

/**
 * Одна кнопка на всю страницу — «заполнить рекомендованным».
 *
 * Раньше она жила внутри виджета крутилок и выглядела так, будто меняет только
 * их, — а меняла ещё и все ответы ниже. Кнопка, которая делает больше, чем
 * обещает её место, — это ровно тот сорт вранья, которого страница-канон себе
 * позволить не может. Поэтому она вынесена наверх, где видно весь её охват.
 */
export const FillRecommended: FC<FillRecommendedProps> = ({
    presetLabel,
    unanswered,
    onApply,
    onReset,
}) => (
    <GlassCard
        intensity="strong"
        className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl p-4"
    >
        <div className="min-w-0 flex-1">
            <p className="text-foreground font-bold">
                Не хотите разбираться сами?
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
                Поставим схему «{presetLabel}» и ответим за вас на все вопросы
                так, как советуем. Дальше можно менять что угодно — ничего не
                зафиксируется, пока вы не решите.
            </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Button
                size="lg"
                onClick={onApply}
                className="border-success/50 bg-success/10 text-success hover:bg-success/20 min-w-0 flex-1 gap-2 border sm:flex-none"
            >
                <Wand2 className="size-4" />
                {/* На узком экране обрезать слово хуже, чем сказать короче. */}
                <span className="sm:hidden">Заполнить</span>
                <span className="hidden sm:inline">
                    Заполнить рекомендованным
                </span>
                {unanswered > 0 && (
                    <span className="bg-success/20 rounded-full px-1.5 text-xs font-bold">
                        {unanswered}
                    </span>
                )}
            </Button>

            <Button
                variant="ghost"
                onClick={onReset}
                title="Вернуть значения по умолчанию"
                className="text-muted-foreground gap-1.5"
            >
                <RotateCcw className="size-4" />
                Сбросить
            </Button>
        </div>
    </GlassCard>
);
