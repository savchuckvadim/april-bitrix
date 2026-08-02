'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import {
    Collapsible,
    CollapsibleContent,
} from '@workspace/ui/components/collapsible';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_BORDER, type Tone, type ToneState } from '../../lib/tones';
import { GlassCard } from '../../shared/ui/Glass/GlassCard';
import { SectionCardHeader } from './SectionCardHeader';

export type SectionCardSurface = 'solid' | 'glass' | 'liquid';

export interface SectionCardProps {
    title?: ReactNode;
    description?: ReactNode;
    /** Правый слот шапки: свитчи, бэйджи, кнопки. */
    actions?: ReactNode;
    /**
     * Цвет заголовка и акцентной кромки. `event` наследуется от ближайшего
     * контейнера с data-event-type через реактивный токен --event-current,
     * поэтому смена типа события перекрашивает секцию сама.
     */
    tone?: Tone;
    /** Акцентная левая кромка в цвет tone. */
    accent?: boolean;
    /** Состояние секции: красит рамку и текст message. */
    state?: ToneState;
    /** Подпись под контентом в цвет состояния: ошибка валидации, предупреждение. */
    message?: ReactNode;
    collapsible?: boolean;
    /** Начальное состояние в неконтролируемом режиме. */
    defaultOpen?: boolean;
    /** Контролируемый режим — вместе с onOpenChange. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /**
     * Поверхность карточки:
     * - `solid` — обычная непрозрачная карточка;
     * - `glass` — полупрозрачная подложка с блюром (дёшево, работает везде);
     * - `liquid` — «жидкое стекло» с рефракцией фона как у iOS (reactbits
     *   GlassSurface, Chromium; в Safari/Firefox автоматический откат).
     *
     * Оба стеклянных варианта подчиняются общему выключателю (data-glass
     * на <html>): выключили — карточка становится обычной, а тяжёлый
     * GlassSurface вообще не рендерится.
     *
     * Стекло требует фона под собой — на странице должен быть GlassAmbient
     * или иная подложка, иначе размывать нечего.
     */
    surface?: SectionCardSurface;
    /** `compact` — плотный режим для карточки сущности во фрейме Битрикса. */
    density?: 'comfortable' | 'compact';
    footer?: ReactNode;
    className?: string;
    contentClassName?: string;
    children: ReactNode;
}

const STATE_BORDER: Record<ToneState, string> = {
    default: '',
    disabled: '',
    warning: 'border-warning',
    error: 'border-destructive',
};

const STATE_MESSAGE: Record<ToneState, string> = {
    default: 'text-muted-foreground',
    disabled: 'text-muted-foreground',
    warning: 'text-warning',
    error: 'text-destructive',
};

/**
 * Карточка-секция — ЕДИНСТВЕННАЯ карточка для приложений монорепы.
 *
 * До неё связка `<Card><CardHeader><CardTitle className="text-base">` была
 * скопирована руками по 189 файлам, а строка ошибки, левая кромка и
 * раскрывашка писались заново в каждой секции. Теперь вид карточек правится
 * в одном месте.
 *
 * Сырой shadcn `Card*` в приложениях использовать не нужно — он примитив
 * этого компонента.
 */
export const SectionCard = ({
    title,
    description,
    actions,
    tone = 'neutral',
    accent = false,
    state = 'default',
    message,
    collapsible = false,
    defaultOpen = true,
    open,
    onOpenChange,
    surface = 'solid',
    density = 'comfortable',
    footer,
    className,
    contentClassName,
    children,
}: SectionCardProps) => {
    const compact = density === 'compact';
    const isDisabled = state === 'disabled';
    const isLiquid = surface === 'liquid';

    const shellClassName = cn(
        compact && 'gap-3 py-3',
        // .glass несёт свои фон/рамку/тень — карточные гасим, иначе сквозь
        // непрозрачный bg-card ничего не будет видно.
        surface === 'glass' && 'glass border-transparent bg-transparent',
        accent && cn('border-l-4', TONE_BORDER[tone]),
        STATE_BORDER[state],
        isDisabled && 'pointer-events-none opacity-60',
        className,
    );

    const body = (
        <>
            <CardContent
                className={cn(compact ? 'space-y-2 px-3' : 'space-y-3', contentClassName)}
            >
                {children}
                {message && (
                    <p className={cn('text-sm', STATE_MESSAGE[state])}>{message}</p>
                )}
            </CardContent>
            {footer && (
                <CardFooter className={cn(compact && 'px-3')}>{footer}</CardFooter>
            )}
        </>
    );

    const hasHeader = Boolean(title || description || actions);

    const header = hasHeader ? (
        <SectionCardHeader
            title={title}
            description={description}
            actions={actions}
            tone={tone}
            collapsible={collapsible}
            compact={compact}
        />
    ) : null;

    // Контролируемый режим включаем только когда open реально передан:
    // Radix различает undefined и false, иначе секция залипнет закрытой.
    const collapsibleProps = open === undefined ? { defaultOpen } : { open };

    const inner = collapsible ? (
        <Collapsible {...collapsibleProps} onOpenChange={onOpenChange}>
            {header}
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                {body}
            </CollapsibleContent>
        </Collapsible>
    ) : (
        <>
            {header}
            {body}
        </>
    );

    // liquid рисуется не карточным div'ом, а GlassSurface — поэтому раскладку
    // Card (колонка + отступы) повторяем классами. CardHeader/CardContent
    // самодостаточны и от контекста Card не зависят.
    if (isLiquid) {
        return (
            <GlassCard
                intensity="liquid"
                aria-disabled={isDisabled || undefined}
                className={cn(
                    'flex flex-col rounded-xl',
                    compact ? 'gap-3 py-3' : 'gap-6 py-6',
                    accent && cn('border-l-4', TONE_BORDER[tone]),
                    STATE_BORDER[state],
                    isDisabled && 'pointer-events-none opacity-60',
                    className,
                )}
            >
                {inner}
            </GlassCard>
        );
    }

    return (
        <Card className={shellClassName} aria-disabled={isDisabled || undefined}>
            {inner}
        </Card>
    );
};
