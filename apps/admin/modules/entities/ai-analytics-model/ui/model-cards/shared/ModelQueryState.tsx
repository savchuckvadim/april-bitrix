'use client';

import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MicroSpinner } from '@workspace/april-ui/feedback';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { MODEL_TEXT } from '../../../consts/ai-analytics-model.const';

/** То, что нужно от useQuery: данные, загрузка, ошибка. */
export interface ModelQueryLike<TData> {
    data: TData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}

interface ModelQueryStateProps<TData, TView> {
    domain?: string;
    query: ModelQueryLike<TData>;
    /** Ответ → вид карточки; null — данных ещё нет (честная заглушка). */
    select: (data: TData) => TView | null;
    emptyHint: string;
    children: (view: TView) => ReactNode;
}

const Muted = ({ children }: { children: ReactNode }) => (
    <p className="text-sm text-muted-foreground">{children}</p>
);

/**
 * Общие состояния карточки: портал не выбран, загрузка, ошибка ручки,
 * «данных ещё нет». Содержимое рисуется только по готовому виду.
 */
export const ModelQueryState = <TData, TView>({
    domain,
    query,
    select,
    emptyHint,
    children,
}: ModelQueryStateProps<TData, TView>) => {
    if (!domain) return <Muted>{MODEL_TEXT.selectPortal}</Muted>;
    if (query.isLoading) {
        return (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MicroSpinner />
                {MODEL_TEXT.loading}
            </span>
        );
    }
    if (query.isError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertTitle>{MODEL_TEXT.loadError}</AlertTitle>
                <AlertDescription>
                    <p>{getApiErrorMessage(query.error)}</p>
                </AlertDescription>
            </Alert>
        );
    }
    const view = query.data === undefined ? null : select(query.data);
    if (view === null) {
        return (
            <div className="space-y-1">
                <Muted>{MODEL_TEXT.empty}</Muted>
                <p className="text-xs text-muted-foreground">{emptyHint}</p>
            </div>
        );
    }
    return <>{children(view)}</>;
};
