'use client';

import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowBack } from './ArrowBack';

export const Navigation = () => {
    const pathname = usePathname();
    const links = [
        { href: '/report/kpi', label: 'KPI' },
        { href: '/report/financial', label: 'Финансы' },
    ];
    const [isNavigated, setIsNavigated] = useState(false);
    return (
        <div className="flex flex-row items-center gap-2">
            {isNavigated && <ArrowBack />}
            <nav className="flex flex-row gap-2">
                {links.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsNavigated(true)}
                        >
                            <Button variant={isActive ? 'default' : 'outline'}
                                className={"h-7 w-20 text-center rounded-md"}>

                                {link.label.toLocaleLowerCase()}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
