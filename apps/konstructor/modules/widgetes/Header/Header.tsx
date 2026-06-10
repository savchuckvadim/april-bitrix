'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { DocumentGlobalConfig } from '@/modules/widgetes';
import { useIsClientMounted } from '@/modules/app';
import { NavMenu } from '../Navigation/NavMenu';
import Image from 'next/image';

interface HeaderProps {
    brandComponent?: React.ReactNode;
    className?: string;
}

export function Header({ className, brandComponent }: HeaderProps) {
    const isClient = useIsClientMounted();

    return (
        <div
            className={cn(
                'sticky top-0 left-0  w-full  bg-background z-50',
                className,
            )}
        >
            <header>
                <div className="w-full  mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Логотип */}
                        <div className="flex items-center space-x-3">

                            {brandComponent || (
                                <Link
                                    href="/bitrix"
                                    className="text-md font-semibold text-primary-foreground hover:text-blue-600 transition-colors"
                                >
                                    <div className="flex items-center row gap-2">
                                        <Image src="/logo/logo.svg" alt="April crm" width={20} height={20} />
                                        <p className="text-md font-semibold text-primary-foreground hover:text-primary transition-colors">April crm</p>
                                    </div>

                                </Link>
                            )}
                        </div>

                        {/* Навигация */}
                        <NavMenu withMobile={false} />
                    </div>
                </div>
            </header>
            {isClient && <DocumentGlobalConfig />}
        </div>
    );
}
