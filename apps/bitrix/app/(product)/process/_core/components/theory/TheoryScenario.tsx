'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface TheoryScenarioProps {
    title: string;
    options: { label: string; meaning: string }[];
}

/**
 * Виджет-сценарий: «а что это значит?».
 *
 * Работает как фильтр — читатель переключает условие и сразу видит следствие.
 * Снимает необходимость держать в голове матрицу вариантов.
 *
 * Отличие от врезки «Дискурс»: виджет ОБЪЯСНЯЕТ и ни к чему не обязывает, его
 * можно листать без последствий. Дискурс ТРЕБУЕТ решения и ведёт в анкету.
 */
export const TheoryScenario: FC<TheoryScenarioProps> = ({ title, options }) => {
    const [active, setActive] = useState(0);

    return (
        <div className="bg-card rounded-xl border p-4">
            <p className="text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <SlidersHorizontal className="size-3.5" aria-hidden />
                {title}
            </p>

            <div
                role="radiogroup"
                aria-label={title}
                className="mt-2.5 flex flex-wrap gap-1.5"
            >
                {options.map((option, index) => (
                    <button
                        key={option.label}
                        type="button"
                        role="radio"
                        aria-checked={index === active}
                        onClick={() => setActive(index)}
                        className={cn(
                            'focus-visible:outline-primary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2',
                            index === active
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:border-primary hover:text-primary',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <p
                aria-live="polite"
                className="text-foreground/90 mt-3 text-sm leading-relaxed"
            >
                {options[active]?.meaning}
            </p>
        </div>
    );
};
