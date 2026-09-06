import React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { ArrowRight, Download } from 'lucide-react';
import { HowPageCtaContent } from '../constants/types';

interface HowPageCtaProps {
    cta: HowPageCtaContent;
}

/**
 * Финальная карточка страницы: заголовок, пояснение и действие.
 *
 * `cta.download` переключает действие с перехода по маршруту на скачивание
 * файла из `public/` — для таких ссылок нужен обычный <a download>, а не
 * next/link.
 */
export const HowPageCta: React.FC<HowPageCtaProps> = ({ cta }) => (
    <footer className="mt-14 rounded-xl border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <p className="font-semibold text-foreground">{cta.label}</p>
                {cta.note && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {cta.note}
                    </p>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                {cta.secondary && (
                    <Button asChild variant="outline" size="lg">
                        <Link href={cta.secondary.href}>
                            {cta.secondary.label}
                        </Link>
                    </Button>
                )}
                <Button asChild size="lg">
                    {cta.download ? (
                        <a href={cta.href} download>
                            Скачать
                            <Download className="ml-1.5 h-4 w-4" />
                        </a>
                    ) : (
                        <Link href={cta.href}>
                            Продолжить
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                    )}
                </Button>
            </div>
        </div>
    </footer>
);
