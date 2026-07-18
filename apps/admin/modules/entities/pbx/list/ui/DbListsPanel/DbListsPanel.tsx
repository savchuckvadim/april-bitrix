'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { JsonView } from '../../../lib/ui';
import type { PortalLists } from '../../model';
import { DbFieldsTable } from './components/DbFieldsTable';

/**
 * Списки портала как они физически лежат в PortalDB: строки `bitrixlists`
 * с IBLOCK_ID и поля `bitrixfields` со всеми идентификаторами, по которым
 * работают интеграции. Живое состояние Bitrix — во вкладках «Списки»/«Поля».
 */
export function DbListsPanel({
    data,
    loading,
}: {
    data?: PortalLists;
    loading?: boolean;
}) {
    if (loading) {
        return <p className="text-sm text-muted-foreground">Загрузка БД…</p>;
    }
    const lists = data?.lists ?? [];
    if (lists.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                В PortalDB (`bitrixlists`) записей нет — списки ещё не
                устанавливались.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {lists.map((list) => (
                <div key={list.id} className="space-y-2">
                    <div>
                        <p className="font-medium">
                            {list.name}{' '}
                            <span className="font-mono text-xs text-muted-foreground">
                                ({list.type} / {list.group})
                            </span>
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                            id: {list.id} · code: {list.code} · IBLOCK_ID:{' '}
                            {list.bitrixId} · title: {list.title} · полей:{' '}
                            {list.fields.length}
                        </p>
                    </div>
                    <DbFieldsTable fields={list.fields} />
                </div>
            ))}

            <Accordion type="single" collapsible>
                <AccordionItem value="raw">
                    <AccordionTrigger className="text-sm">
                        Сырой ответ БД
                    </AccordionTrigger>
                    <AccordionContent>
                        <JsonView data={data} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
