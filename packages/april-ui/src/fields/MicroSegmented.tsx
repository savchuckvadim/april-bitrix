'use client';

import { cn } from '@workspace/ui/lib/utils';

export interface MicroSegmentedOption {
    value: string;
    label: string;
    /**
     * Класс активного состояния — когда у значения свой цвет («Отказ» красный,
     * «В работе» зелёный). Не задан — обычная подсветка темы.
     */
    activeClass?: string;
}

export type MicroSegmentedSize = 'xs' | 'sm';

export interface MicroSegmentedProps {
    options: MicroSegmentedOption[];
    value?: string;
    onChange: (value: string) => void;
    ariaLabel: string;
    size?: MicroSegmentedSize;
    /** Сегменты делят ширину поровну (иначе — по содержимому). */
    stretch?: boolean;
    className?: string;
}

const SIZE_CLASS: Record<MicroSegmentedSize, string> = {
    xs: 'text-[0.6875rem] px-2 py-0.5',
    sm: 'text-xs px-2 py-1',
};

/**
 * Переключатель из двух-четырёх значений: все варианты видно сразу.
 *
 * Там, где выбор — главное действие экрана, выпадающий список платит лишним
 * кликом за самое частое, а варианты прячет. Сегменты показывают их все и
 * ставятся одним тапом.
 *
 * Больше четырёх значений сюда не помещается — это уже селект.
 */
export const MicroSegmented = ({
    options,
    value,
    onChange,
    ariaLabel,
    size = 'sm',
    stretch = false,
    className,
}: MicroSegmentedProps) => (
    <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(
            'inline-flex flex-wrap gap-0.5 rounded-md bg-muted p-0.5',
            stretch && 'flex w-full',
            className,
        )}
    >
        {options.map(option => {
            const isCurrent = option.value === value;
            return (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isCurrent}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'cursor-pointer rounded-sm whitespace-nowrap transition-colors',
                        SIZE_CLASS[size],
                        stretch && 'min-w-0 flex-1',
                        isCurrent
                            ? (option.activeClass ??
                                  'bg-card font-medium text-foreground shadow-sm')
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);
