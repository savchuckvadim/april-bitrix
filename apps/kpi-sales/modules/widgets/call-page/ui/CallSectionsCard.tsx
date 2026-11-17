'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    sectionAnchorId,
    type CallPageSectionDto,
} from '@/modules/entities/call-page';
import { CallSectionRow } from './CallSectionRow';

interface CallSectionsCardProps {
    sections: CallPageSectionDto[];
    onOpenHighlight: (id: string | null) => void;
}

/** Разделы разговора с оценкой, разбором и советом. */
export const CallSectionsCard = ({
    sections,
    onOpenHighlight,
}: CallSectionsCardProps) => {
    if (sections.length === 0) return null;
    return (
        <SectionCard
            title="Разделы разговора"
            description="Только разделы, которые относятся к этому типу звонка."
        >
            <ul className="space-y-3 text-sm">
                {sections.map((section, position) => (
                    <CallSectionRow
                        key={`${position}-${section.title}`}
                        section={section}
                        anchorId={sectionAnchorId(position)}
                        onOpenHighlight={onOpenHighlight}
                    />
                ))}
            </ul>
        </SectionCard>
    );
};
