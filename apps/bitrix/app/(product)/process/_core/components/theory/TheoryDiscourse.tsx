'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, GitFork } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { SALES_BASE_PATH } from '../../constants/views';
import { discourseAnchor } from '../../lib/anchors.util';
import { getProcessConfig, saveProcessConfig } from '../../lib/config-storage';
import type { DiscoursePosition } from '../../theory-types';
import type { ProcessConfig } from '../../types';

interface TheoryDiscourseProps {
    question: string;
    positions: DiscoursePosition[];
    price: string;
    recommendation?: string;
    preview?: Partial<ProcessConfig>;
}

/**
 * Врезка «Дискурс» — конфликтная развилка.
 *
 * Пять тактов: вопрос, позиции сторон с носителями, цена, рекомендация. Эти
 * вопросы всё равно будут решены — либо спокойно здесь, либо конфликтом через
 * полгода, уже с людьми и обидами. Поэтому врезка выглядит как перекрёсток, а
 * не как ошибка.
 *
 * Кнопка «Посмотреть на схеме» — главная связка раздела: она ставит обсуждаемую
 * конфигурацию и уводит в конфигуратор. Рассказ и инструмент перестают быть
 * двумя разными вещами.
 */
export const TheoryDiscourse: FC<TheoryDiscourseProps> = ({
    question,
    positions,
    price,
    recommendation,
    preview,
}) => {
    const router = useRouter();

    const showOnSchema = () => {
        if (!preview) return;
        const current = getProcessConfig('sales');

        saveProcessConfig('sales', {
            leadPct: preview.leadPct ?? current.leadPct,
            dealPct: preview.dealPct ?? current.dealPct,
            answers: { ...current.answers, ...preview.answers },
        });
        // Ведём не «на схему», а ровно в то место, о котором спорили: иначе
        // читатель приезжает в середину длинной страницы и ищет глазами.
        router.push(`${SALES_BASE_PATH}#${discourseAnchor(preview.answers)}`);
    };

    return (
        <aside className="border-warning/60 bg-warning/5 rounded-xl border-2 p-4">
            <p className="text-warning flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <GitFork className="size-3.5" aria-hidden />
                Дискурс
            </p>

            <h3 className="text-foreground mt-2 font-bold text-balance">
                {question}
            </h3>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {positions.map(position => (
                    <div
                        key={position.who}
                        className="bg-card rounded-lg border p-3"
                    >
                        <p className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
                            {position.who}
                        </p>
                        <p className="text-foreground/90 mt-1 text-sm leading-relaxed">
                            {position.text}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-3 space-y-2 text-sm leading-relaxed">
                <p>
                    <span className="text-warning font-semibold">
                        Чем платим.{' '}
                    </span>
                    <span className="text-foreground/90">{price}</span>
                </p>

                {recommendation ? (
                    <p>
                        <span className="text-success font-semibold">
                            Что рекомендуем.{' '}
                        </span>
                        <span className="text-foreground/90">
                            {recommendation}
                        </span>
                    </p>
                ) : (
                    <p className="text-muted-foreground">
                        <span className="font-semibold">Ответа пока нет. </span>
                        Развилка не решена — и это честнее, чем сделать вид, что
                        решена. Вопрос уходит в лист решений внедрения.
                    </p>
                )}
            </div>

            {preview && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={showOnSchema}
                    className="border-warning/50 text-warning hover:bg-warning/10 mt-3 gap-1.5"
                >
                    {preview.answers
                        ? 'Посмотреть этот вопрос на схеме'
                        : 'Посмотреть эту настройку на схеме'}
                    <ArrowRight className="size-3.5" />
                </Button>
            )}
        </aside>
    );
};
