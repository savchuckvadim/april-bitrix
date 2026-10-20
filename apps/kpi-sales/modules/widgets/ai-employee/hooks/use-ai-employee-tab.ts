'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    AI_EMPLOYEE_TAB_PARAM,
    parseAiEmployeeTab,
    withAiEmployeeTab,
    type AiEmployeeTab,
} from '@/modules/entities/ai-analytics';

/** Подвкладка AI-раздела страницы сотрудника из URL (`?aiUserTab=`) и переход без перезагрузки. */
export const useAiEmployeeTab = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = parseAiEmployeeTab(searchParams.get(AI_EMPLOYEE_TAB_PARAM));

    const setTab = useCallback(
        (next: AiEmployeeTab) => {
            router.replace(
                `${pathname}${withAiEmployeeTab(searchParams.toString(), next)}`,
                { scroll: false },
            );
        },
        [router, pathname, searchParams],
    );

    return { tab, setTab };
};
