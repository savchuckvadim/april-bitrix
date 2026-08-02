'use client';

import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import {
    Card as UICard,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@workspace/ui/components/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";

/**
 * @deprecated В приложениях используйте `SectionCard` из
 * `@workspace/april-ui` — единственную карточку монорепы (тона, состояния,
 * акцентная кромка, стекло). ACard остаётся ради существующих вызовов
 * в admin / bitrix / konstructor и мигрирует постепенно.
 */
export interface CardProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle"> {
    title?: string;
    description?: string;
    headerIcon?: ReactNode;
    headerClassName?: string;
    contentClassName?: string;
    padding?: "sm" | "md" | "lg";
    variant?: "default" | "outlined" | "elevated";
    children: ReactNode;
    footer?: ReactNode;
    footerClassName?: string;
    /**
     * Поверхность карточки. `glass` — полупрозрачная подложка с блюром через
     * утилиту .glass: она построена на токенах --fx-glass-* и подчиняется
     * общему выключателю стекла (data-glass на <html>), поэтому при
     * выключенном стекле карточка сама становится обычной.
     */
    surface?: "solid" | "glass";
    /**
     * Шапка становится кнопкой-раскрывашкой: контент и футер сворачиваются.
     * Без этого пропа карточка рендерится ровно как раньше.
     */
    collapsible?: boolean;
    /** Начальное состояние в неконтролируемом режиме. По умолчанию раскрыта. */
    defaultOpen?: boolean;
    /** Контролируемый режим — задавайте вместе с onOpenChange. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            title,
            description,
            headerIcon,
            headerClassName,
            contentClassName,
            padding = "sm",
            variant = "default",
            surface = "solid",
            children,
            footer,
            footerClassName,
            collapsible = false,
            defaultOpen = true,
            open,
            onOpenChange,
            ...props
        },
        ref
    ) => {
        const paddingClasses = {
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        const variantClasses = {
            default: "",
            outlined: "border",
            elevated: "shadow-md",
        };

        const hasHeader = title || description || headerIcon;

        const headerBody = (
            <>
                {headerIcon}
                {title && <CardTitle className="text-md">{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
            </>
        );

        const body = (
            <>
                <CardContent className={contentClassName}>{children}</CardContent>
                {footer && (
                    <CardFooter className={footerClassName}>{footer}</CardFooter>
                )}
            </>
        );

        const cardClassName = cn(
            paddingClasses[padding],
            variantClasses[variant],
            // .glass задаёт свои фон/рамку/тень — гасим карточные, иначе
            // сквозь непрозрачный bg-card ничего не будет видно.
            surface === "glass" && "glass border-transparent bg-transparent",
            "bg-transparent border-none shadow-none",
            className
        );

        if (!collapsible) {
            return (
                <UICard ref={ref} className={cardClassName} {...props}>
                    {hasHeader && (
                        <CardHeader className={cn("space-y-2 ", headerClassName)}>
                            {headerBody}
                        </CardHeader>
                    )}
                    {body}
                </UICard>
            );
        }

        // Контролируемый режим включаем только когда open реально передан:
        // Radix различает undefined и false, иначе карточка залипнет закрытой.
        const collapsibleProps = open === undefined ? { defaultOpen } : { open };

        return (
            <UICard ref={ref} className={cardClassName} {...props}>
                <Collapsible {...collapsibleProps} onOpenChange={onOpenChange}>
                    <CardHeader className={cn("space-y-2 ", headerClassName)}>
                        <CollapsibleTrigger
                            className="group flex w-full cursor-pointer items-center justify-between gap-2 text-left"
                            aria-label={hasHeader ? undefined : "Развернуть"}
                        >
                            <div className="min-w-0 space-y-2">{headerBody}</div>
                            <ChevronDown
                                aria-hidden
                                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                            />
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        {body}
                    </CollapsibleContent>
                </Collapsible>
            </UICard>
        );
    }
);

Card.displayName = "Card";
