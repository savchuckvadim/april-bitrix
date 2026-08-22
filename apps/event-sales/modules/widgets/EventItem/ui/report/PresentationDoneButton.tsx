'use client';

import { FC } from 'react';
import { Check, Zap } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { usePresentationDone } from '../../lib/hooks/use-presentation-done';

/**
 * «Была проведена» — та самая яркая кнопка из оригинала.
 *
 * Отмечает презентацию проведённой и сразу открывает опросник, если он
 * применим: раньше это были два разных элемента в разных местах формы.
 * Пока не отмечена — зовёт эхо-кольцами цвета презентации (animate-echo-ring,
 * гейт withPresentationAnimate): волна расходится от кнопки вместо прежнего
 * мигания прозрачностью. Отмеченная гаснет в спокойный outline с галочкой
 * и «+1» — видно, что нажатие засчитано.
 */
export const PresentationDoneButton: FC = () => {
    const withAnimate = useAppSelector(
        s => s.app.config.withPresentationAnimate,
    );
    const { isDone, isPresTask, hint, toggle } = usePresentationDone();

    return (
        <HintTooltip
            title={hint.title}
            lines={hint.lines}
            side="bottom"
            align="end"
        >
            <Button
                type="button"
                size="sm"
                variant={isDone ? 'outline' : 'default'}
                onClick={toggle}
                aria-pressed={isDone}
                data-event-type="presentation"
                className={cn(
                    'gap-1.5',
                    !isDone &&
                        'bg-event-current font-semibold text-event-current-foreground hover:bg-event-current/90',
                    // Два кольца со сдвигом фазы: волны расходятся непрерывно.
                    !isDone &&
                        withAnimate &&
                        'relative before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit] before:animate-echo-ring after:pointer-events-none after:absolute after:-inset-px after:rounded-[inherit] after:animate-echo-ring after:[animation-delay:1.3s] motion-reduce:before:animate-none motion-reduce:after:animate-none',
                )}
            >
                {isDone ? (
                    <Check aria-hidden className="size-4" />
                ) : (
                    <Zap aria-hidden className="size-4" />
                )}
                {isDone
                    ? 'Презентация проведена'
                    : isPresTask
                      ? 'Провести презентацию'
                      : 'Провели презентацию'}
                {isDone && (
                    <span className="rounded-full bg-success/10 px-1.5 py-px text-[0.6875rem] font-semibold text-[color:color-mix(in_oklab,var(--success),var(--foreground)_35%)]">
                        +1
                    </span>
                )}
            </Button>
        </HintTooltip>
    );
};
