import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    HOME_CALIBRATION_LINK,
    HOME_CALIBRATION_NOTE,
    HOME_DESCRIPTION,
    HOME_TITLE,
} from '@/lib/home/home-content';

export const metadata: Metadata = {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
    },
};

export default function Page() {
    return (
        <main className="flex min-h-svh items-center bg-background">
            <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
                <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                    {HOME_TITLE}
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                    {HOME_DESCRIPTION}
                </p>
                <p className="mt-4 leading-relaxed text-foreground/90">
                    {HOME_CALIBRATION_NOTE}
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href={HOME_CALIBRATION_LINK.href}>
                        {HOME_CALIBRATION_LINK.label}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </main>
    );
}
