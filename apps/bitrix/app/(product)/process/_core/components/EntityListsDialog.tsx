'use client';

import type { FC } from 'react';
import { ProcessDialog } from './ProcessDialog';
import { EntityListGroupEditor } from './EntityListGroupEditor';
import { ReadinessBadge } from './ReadinessBadge';
import { useEntityLists } from '../hooks/use-entity-lists';
import type { ProcessConfig } from '../types';

interface EntityListsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: ProcessConfig;
    onChange: (lists: Record<string, string[]>) => void;
}

/**
 * Стадии и статусы лида и заявки — рядом, в одном окне.
 *
 * Рядом намеренно: спор о заявке всегда упирается в вопрос «а чем она тогда
 * отличается от лида». Пока два набора лежат на разных страницах, ответить
 * нечем; когда они в двух колонках — разница видна сразу.
 *
 * Отдельно от стадий стоит третий блок «что видно про связанное». Это и есть
 * то, ради чего заявку хотят завести: сама по себе она отвечает только «взяли
 * или нет», а ценность в том, чем закончилась связанная с ней работа.
 */
export const EntityListsDialog: FC<EntityListsDialogProps> = ({
    open,
    onOpenChange,
    config,
    onChange,
}) => {
    const lists = useEntityLists({ config, onChange });

    return (
        <ProcessDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Стадии и статусы: лид и заявка"
            description="Состав можно менять — это черновик разговора, а не форма. Правки попадают в печатный регламент."
        >
            <div className="grid gap-6 lg:grid-cols-2">
                {lists.columns.map(column => (
                    <section key={column.id} className="space-y-4">
                        <header>
                            <p className="text-foreground flex flex-wrap items-center gap-2 font-bold">
                                {column.label}
                                <ReadinessBadge value={column.readiness} />
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                {column.hint}
                            </p>
                        </header>

                        {column.groups.map(group => (
                            <EntityListGroupEditor
                                key={group.id}
                                group={group}
                                items={lists.itemsOf(group.id)}
                                isEdited={lists.isEdited(group.id)}
                                onAdd={value => lists.add(group.id, value)}
                                onRemove={value =>
                                    lists.remove(group.id, value)
                                }
                                onReset={() => lists.reset(group.id)}
                            />
                        ))}
                    </section>
                ))}
            </div>
        </ProcessDialog>
    );
};
