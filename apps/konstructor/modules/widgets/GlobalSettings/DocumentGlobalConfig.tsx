'use client';

import { BackButton } from '@/modules/shared';
import { ThemeToggler } from '@workspace/april-theme';
import { useEffect, useState } from 'react';

export const DocumentGlobalConfig = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="flex  h-14 items-center justify-between p-2 ">
            <div className="flex items-center space-x-2 gap-1">
                <div className="flex items-center justify-between">
                    <BackButton
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                    />
                </div>
                <div className="w-[200px]">
                    {/* ClientTypeSelect */}
                </div>
                <div>
                    {/* ContractType */}
                </div>
                <div>
                    {/* DocumentNumber */}
                </div>
            </div>

            <div className="flex items-center space-x-2 mr-5">
                <ThemeToggler />
                <div>
                    {/* ReloadApp */}
                </div>
            </div>
        </div>
    );
};
