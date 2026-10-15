'use client';

import type { ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { IconAction, SectionCard } from '@workspace/april-ui';
import type { DigestWidgetKey } from '../../lib/digest-tabs';
import { useDigestSection } from '../hooks/use-digest-section';

interface DigestSectionProps {
    widget: DigestWidgetKey;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}

/**
 * Карточка виджета дайджеста: в «Всё» сворачивается (выбор запоминается) и
 * открывается своей подвкладкой; в подвкладке — обычная раскрытая карточка.
 */
export const DigestSection = ({
    widget,
    title,
    description,
    actions,
    children,
}: DigestSectionProps) => {
    const section = useDigestSection(widget);
    return (
        <SectionCard
            surface="glass"
            title={title}
            description={description}
            collapsible={section.collapsible}
            open={section.open}
            onOpenChange={section.changeOpen}
            actions={
                <>
                    {actions}
                    {section.showOpenTab && (
                        <IconAction
                            icon={Maximize2}
                            label="Открыть отдельной вкладкой"
                            onClick={section.openOwnTab}
                        />
                    )}
                </>
            }
        >
            {children}
        </SectionCard>
    );
};
