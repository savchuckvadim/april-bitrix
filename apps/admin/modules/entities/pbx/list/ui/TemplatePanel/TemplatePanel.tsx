'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { JsonView } from '../../../lib/ui';
import type { ListParse } from '../../model';
import { TemplateFieldsTable } from './components/TemplateFieldsTable';

/**
 * Эталон списков из Excel-шаблонов (`monitoring/parse`): что именно будет
 * установлено — списки, их IBLOCK_CODE и поля со всеми кодами и значениями.
 */
export function TemplatePanel({
    data,
    loading,
}: {
    data?: ListParse;
    loading?: boolean;
}) {
    if (loading) {
        return <p className="text-sm text-muted-foreground">Загрузка эталона…</p>;
    }
    const lists = data?.lists ?? [];
    if (lists.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Шаблоны списков не найдены.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {lists.map((list) => (
                <div key={`${list.group}_${list.type}`} className="space-y-2">
                    <div>
                        <p className="font-medium">
                            {list.name}{' '}
                            <span className="font-mono text-xs text-muted-foreground">
                                ({list.type} / {list.group})
                            </span>
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                            IBLOCK_CODE: {list.code} · шаблон:{' '}
                            {list.sourceListName}/{list.sourceGroup} · order:{' '}
                            {list.order} · полей: {list.fields.length}
                        </p>
                    </div>
                    <TemplateFieldsTable list={list} />
                </div>
            ))}

            <Accordion type="single" collapsible>
                <AccordionItem value="raw">
                    <AccordionTrigger className="text-sm">
                        Сырой ответ parse
                    </AccordionTrigger>
                    <AccordionContent>
                        <JsonView data={data} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
