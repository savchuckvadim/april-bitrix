'use client';

import {
    ChevronDown,
    CircleCheck,
    CircleHelp,
    DatabaseZap,
    Hourglass,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_TEXT, type Tone } from '@workspace/april-ui';
import type { AiSettingsTab } from '../../lib/ai-settings-form.util';
import {
    AI_CHECKLIST_SECTION,
    type AiChecklistSection,
    type AiChecklistSectionKey,
} from '../../lib/ai-setup-checklist.types';
import { aiChecklistUnknownLines } from '../../lib/ai-setup-checklist.util';
import { AiSetupChecklistItem } from './AiSetupChecklistItem';

interface AiSetupChecklistSectionProps {
    section: AiChecklistSection;
    onOpenSettings?: (tab: AiSettingsTab) => void;
}

/** Иконка и тон заголовка раздела. */
const SECTION_VIEW: Record<
    AiChecklistSectionKey,
    { icon: LucideIcon; tone: Tone }
> = {
    [AI_CHECKLIST_SECTION.DATA]: { icon: DatabaseZap, tone: 'destructive' },
    [AI_CHECKLIST_SECTION.CONFIGURE]: { icon: Wrench, tone: 'warning' },
    [AI_CHECKLIST_SECTION.WAIT]: { icon: Hourglass, tone: 'info' },
    [AI_CHECKLIST_SECTION.UNKNOWN]: { icon: CircleHelp, tone: 'muted' },
    [AI_CHECKLIST_SECTION.DONE]: { icon: CircleCheck, tone: 'success' },
};

const SectionTitle = ({ section }: { section: AiChecklistSection }) => {
    const { icon: Icon, tone } = SECTION_VIEW[section.key];
    return (
        <span
            className={cn(
                'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
                TONE_TEXT[tone],
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {section.title} · {section.items.length}
        </span>
    );
};

/** «Готово» — свёрнуто: заголовки пунктов с короткой деталью. */
const AiSetupChecklistDone = ({ section }: { section: AiChecklistSection }) => (
    <Collapsible>
        <CollapsibleTrigger className="group flex items-center gap-1">
            <SectionTitle section={section} />
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
            <ul className="mt-1 space-y-0.5 pl-5 text-xs">
                {section.items.map(item => (
                    <li key={item.key}>
                        <span className="font-medium">{item.title}</span>
                        <span className="text-muted-foreground">
                            {' '}
                            — {item.detail}
                        </span>
                    </li>
                ))}
            </ul>
        </CollapsibleContent>
    </Collapsible>
);

/**
 * Раздел чек-листа: «Сначала данные» / «Настроить» / «Подождать» — полные
 * пункты; «Не проверить сейчас» — одной строкой; «Готово» — свёрнуто.
 */
export const AiSetupChecklistSection = ({
    section,
    onOpenSettings,
}: AiSetupChecklistSectionProps) => {
    if (section.key === AI_CHECKLIST_SECTION.DONE) {
        return <AiSetupChecklistDone section={section} />;
    }
    if (section.key === AI_CHECKLIST_SECTION.UNKNOWN) {
        return (
            <div className="space-y-0.5">
                <SectionTitle section={section} />
                <ul className="space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {aiChecklistUnknownLines(section.items).map(line => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return (
        <div className="space-y-1.5">
            <SectionTitle section={section} />
            <ul className="space-y-2.5 pl-5">
                {section.items.map(item => (
                    <AiSetupChecklistItem
                        key={item.key}
                        item={item}
                        onOpenSettings={onOpenSettings}
                    />
                ))}
            </ul>
        </div>
    );
};
