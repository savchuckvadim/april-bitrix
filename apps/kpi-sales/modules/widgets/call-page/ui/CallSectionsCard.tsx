import { SectionCard } from '@workspace/april-ui/surfaces';
import type { CallPageSectionDto } from '@/modules/entities/call-page';
import { CallSectionRow } from './CallSectionRow';

/** Разделы разговора с оценкой, разбором и советом. */
export const CallSectionsCard = ({
    sections,
}: {
    sections: CallPageSectionDto[];
}) => {
    if (sections.length === 0) return null;
    return (
        <SectionCard
            title="Разделы разговора"
            description="Только разделы, которые относятся к этому типу звонка."
        >
            <ul className="space-y-3 text-sm">
                {sections.map(section => (
                    <CallSectionRow key={section.title} section={section} />
                ))}
            </ul>
        </SectionCard>
    );
};
