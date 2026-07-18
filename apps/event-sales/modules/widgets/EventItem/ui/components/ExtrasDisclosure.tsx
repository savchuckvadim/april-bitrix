'use client';

import { FC, ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { CompanySection } from '../sections/CompanySection';

/**
 * Второстепенные секции (компания, записи звонков) одной раскрывашкой —
 * в compact-режиме карточки сущности экономим высоту; наиболее актуальное
 * (контакт) живёт снаружи, всегда открыто. Записи (lazy RecordsList)
 * начинают грузиться только после раскрытия.
 */
export const ExtrasDisclosure: FC<{ records?: ReactNode }> = ({ records }) => {
    const [open, setOpen] = useState(false);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground">
                <span>Компания{records ? ', записи звонков' : ''}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
                <CompanySection />
                {open && records}
            </CollapsibleContent>
        </Collapsible>
    );
};
