import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { PLATFORM_COPY } from '../model/copy';
import { PLATFORM_DEMO_HREF } from '../model/navigation';

export interface DemoButtonProps {
    label?: string;
    className?: string;
    /** Например, закрыть мобильное меню: переход по якорю путь не меняет. */
    onClick?: () => void;
}

/** Главное действие раздела — заявка на демо; ведёт к форме внизу страницы. */
export function DemoButton({ label = PLATFORM_COPY.demoCta, className, onClick }: DemoButtonProps) {
    return (
        <Button asChild size="lg" className={cn('h-12 px-6 text-base', className)}>
            <Link href={PLATFORM_DEMO_HREF} onClick={onClick}>
                {label}
                <ArrowRight className="size-5" aria-hidden />
            </Link>
        </Button>
    );
}
