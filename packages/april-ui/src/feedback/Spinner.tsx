import { cn } from '@workspace/ui/lib/utils';
import { TONE_TEXT, type Tone } from '../lib/tones';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
    size?: SpinnerSize;
    /** Цвет кольца. По умолчанию — primary. */
    tone?: Tone;
    /** Подпись для скринридера; визуально скрыта. */
    label?: string;
    className?: string;
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
    sm: 'size-4 border-2',
    md: 'size-6 border-2',
    lg: 'size-10 border-[3px]',
    xl: 'size-16 border-4',
};

/**
 * Кольцевой спиннер дизайн-системы: приглушённый трек + яркая «голова».
 * Тот же рецепт, что у BootPreloader, — состояния загрузки выглядят
 * одинаково и до, и после гидратации.
 *
 * Заменяет две байт-идентичные локальные копии в kpi-sales и kpi-service,
 * где размер large задавался классом `h-18 w-18` — такой утилиты в Tailwind
 * нет, поэтому «большой» спиннер молча оставался обычным.
 *
 * Цвет берём через currentColor: тон задаёт text-*, а грани кольца —
 * border-current с прозрачностью. Так один набор классов работает для
 * любого тона, без параллельной таблицы бордеров.
 */
export const Spinner = ({
    size = 'md',
    tone = 'primary',
    label = 'Загрузка',
    className,
}: SpinnerProps) => (
    <span
        role="status"
        aria-live="polite"
        className={cn('inline-flex items-center justify-center', className)}
    >
        <span
            className={cn(
                'animate-spin rounded-full border-current/25 border-t-current motion-reduce:animate-none',
                SIZE_CLASS[size],
                TONE_TEXT[tone],
            )}
        />
        <span className="sr-only">{label}</span>
    </span>
);
