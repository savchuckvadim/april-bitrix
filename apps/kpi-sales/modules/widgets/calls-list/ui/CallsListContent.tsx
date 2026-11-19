'use client';

import { Pager } from '@workspace/april-ui/navigation';
import {
    CALLS_LIST_PAGE_SIZES,
    CALLS_LIST_TEXT,
    type CallsListError,
    type CallsListPatch,
    type CallsListQuery,
    type CallsListResponse,
} from '@/modules/entities/calls-list';
import { callsListViewOf } from '../lib/calls-list-view';
import { CallsListTable } from './CallsListTable';
import { CallsListSkeleton } from './components/CallsListSkeleton';
import { CallsListState } from './components/CallsListState';

interface CallsListContentProps {
    query: CallsListQuery;
    data: CallsListResponse | null;
    loading: boolean;
    error: CallsListError | null;
    periodInvalid: boolean;
    filtered: boolean;
    onChange: (patch: CallsListPatch) => void;
    onReset: () => void;
    onRetry: () => void;
}

const isPageSize = (value: number): value is CallsListQuery['pageSize'] =>
    (CALLS_LIST_PAGE_SIZES as readonly number[]).includes(value);

/** Под фильтрами: таблица со страницами, скелет, пусто, нет доступа или ошибка. */
export const CallsListContent = ({
    query,
    data,
    loading,
    error,
    periodInvalid,
    filtered,
    onChange,
    onReset,
    onRetry,
}: CallsListContentProps) => {
    const view = callsListViewOf({ periodInvalid, error, data });
    switch (view) {
        case 'forbidden':
            return (
                <CallsListState
                    kind="forbidden"
                    message={error?.message ?? CALLS_LIST_TEXT.states.forbiddenTitle}
                />
            );
        case 'period':
            return null;
        case 'error':
            return (
                <CallsListState
                    kind="error"
                    message={error?.message ?? CALLS_LIST_TEXT.states.errorFallback}
                    onRetry={onRetry}
                />
            );
        case 'loading':
            return <CallsListSkeleton />;
        case 'empty':
            return <CallsListState kind="empty" filtered={filtered} onReset={onReset} />;
        default:
            return (
                <div className="space-y-3">
                    <CallsListTable items={data?.items ?? []} loading={loading} />
                    <Pager
                        page={query.page}
                        pageSize={query.pageSize}
                        total={data?.total ?? 0}
                        loading={loading}
                        pageSizes={CALLS_LIST_PAGE_SIZES}
                        onPageChange={page => onChange({ page })}
                        onPageSizeChange={size =>
                            isPageSize(size) && onChange({ pageSize: size })
                        }
                    />
                </div>
            );
    }
};
