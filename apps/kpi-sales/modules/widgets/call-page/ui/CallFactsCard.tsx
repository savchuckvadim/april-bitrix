import { SectionCard } from '@workspace/april-ui/surfaces';
import { cn } from '@workspace/ui/lib/utils';
import {
    CALL_PAGE_TEXT_CLASS,
    type CallPageFactDto,
} from '@/modules/entities/call-page';

/** Итоги разговора: «показатель — значение», тревожное выделено цветом. */
export const CallFactsCard = ({ facts }: { facts: CallPageFactDto[] }) => {
    if (facts.length === 0) return null;
    return (
        <SectionCard title="Итоги разговора">
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[12rem_minmax(0,1fr)]">
                {facts.map(fact => (
                    <div key={fact.label} className="contents">
                        <dt className="text-muted-foreground">{fact.label}</dt>
                        <dd className={cn(CALL_PAGE_TEXT_CLASS[fact.tone])}>
                            {fact.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </SectionCard>
    );
};
