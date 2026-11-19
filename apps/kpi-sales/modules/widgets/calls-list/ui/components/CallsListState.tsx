import { AlertTriangle, Inbox, Lock } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { EmptyState } from '@workspace/april-ui/feedback';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';

const T = CALLS_LIST_TEXT.states;

export type CallsListStateProps =
    /** Разборов нет; filtered — заданы фильтры (можно сбросить). */
    | { kind: 'empty'; filtered: boolean; onReset: () => void }
    /** Не руководитель — 403, текст сервера. */
    | { kind: 'forbidden'; message: string }
    /** Сбой — текст и «Повторить». */
    | { kind: 'error'; message: string; onRetry: () => void };

/** Пусто, нет доступа или ошибка — вместо таблицы. */
export const CallsListState = (props: CallsListStateProps) => {
    if (props.kind === 'forbidden') {
        return (
            <EmptyState
                icon={Lock}
                tone="warning"
                title={props.message}
                description={T.forbiddenText}
            />
        );
    }
    if (props.kind === 'error') {
        return (
            <EmptyState
                icon={AlertTriangle}
                tone="destructive"
                title={props.message}
                actions={
                    <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
                        {T.retry}
                    </Button>
                }
            />
        );
    }
    return (
        <EmptyState
            icon={Inbox}
            title={T.emptyTitle}
            description={props.filtered ? T.emptyFilteredText : T.emptyText}
            actions={
                props.filtered ? (
                    <Button type="button" variant="outline" size="sm" onClick={props.onReset}>
                        {CALLS_LIST_TEXT.filters.reset}
                    </Button>
                ) : undefined
            }
        />
    );
};
