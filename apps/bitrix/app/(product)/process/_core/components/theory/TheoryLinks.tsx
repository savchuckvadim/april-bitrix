import type { FC } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { THEORY_TABS, salesTabPath } from '../../constants/views';

/**
 * Вход в раздел «Теория» со схемы процесса.
 *
 * Стоит перед вопросами намеренно: крутилки отвечают «как», теория — «почему».
 * Тому, кто пришёл принимать решение, второе нужнее первого.
 */
export const TheoryLinks: FC = () => (
    <section aria-labelledby="theory-links-title">
        <p
            id="theory-links-title"
            className="text-muted-foreground flex items-center gap-2 pb-2 text-xs font-bold tracking-widest uppercase"
        >
            <BookOpen className="size-3.5" aria-hidden />
            Прежде чем крутить
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
            {THEORY_TABS.map(tab => (
                <Link
                    key={tab.slug}
                    href={salesTabPath(tab.slug)}
                    className="focus-visible:outline-primary rounded-2xl focus-visible:outline-2"
                >
                    <GlassCard
                        intensity="soft"
                        className="hover:border-primary/50 h-full p-4 transition-colors"
                    >
                        <p className="text-foreground flex items-center gap-2 font-semibold">
                            {tab.label}
                            <ArrowRight className="text-primary size-4" />
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                            {tab.hint}
                        </p>
                    </GlassCard>
                </Link>
            ))}
        </div>
    </section>
);
