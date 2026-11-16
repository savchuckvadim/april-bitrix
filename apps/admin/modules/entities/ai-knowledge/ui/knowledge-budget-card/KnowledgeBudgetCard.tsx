'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { KNOWLEDGE_BUDGET_TEXT } from '../../consts/knowledge-budget.texts';
import { useKnowledgeBudget } from '../../lib/hooks/use-knowledge';
import { toKnowledgeBudgetView } from '../../lib/knowledge-budget-view.util';
import { KnowledgeBudgetTable } from './KnowledgeBudgetTable';

const T = KNOWLEDGE_BUDGET_TEXT;

/**
 * «Сколько материалов попадает в разбор»: по каждому виду базы знаний
 * портала — объём, предел в запросе к модели и что обрезается. Считается на
 * бэкенде по той же таблице пределов, по которой материалы режет разбор;
 * после загрузки, правки или удаления документа пересчитывается сама.
 */
export const KnowledgeBudgetCard = ({ domain }: { domain: string }) => {
    const query = useKnowledgeBudget(domain);
    const view = query.data ? toKnowledgeBudgetView(query.data) : null;

    return (
        <SectionCard
            title={T.title}
            description={T.description}
            contentClassName="space-y-3"
        >
            {query.isLoading && (
                <p className="text-sm text-muted-foreground">{T.loading}</p>
            )}
            {query.isError && (
                <p className="text-sm text-destructive">{T.error}</p>
            )}
            {view && (
                <>
                    {view.notes.map((note) => (
                        <p key={note} className="text-sm text-muted-foreground">
                            {note}
                        </p>
                    ))}
                    <KnowledgeBudgetTable rows={view.rows} />
                    <p className="text-xs text-muted-foreground">
                        {T.howToRead}
                    </p>
                </>
            )}
        </SectionCard>
    );
};
