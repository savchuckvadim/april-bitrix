'use client';

import { MicroSelect } from '@workspace/april-ui';
import { FEED_STACK_OPTIONS, type FeedStackFilter } from '../lib/digest-feed.util';

interface DigestFeedFiltersProps {
    stack: FeedStackFilter;
    onStack: (value: string) => void;
    typeCode: string;
    onType: (value: string) => void;
    typeOptions: { value: string; label: string }[];
    /** Сколько записей после фильтров из скольких. */
    shown: number;
    total: number;
}

/** Фильтры ленты: исход события и тип; счётчик «показано N из M». */
export const DigestFeedFilters = ({
    stack,
    onStack,
    typeCode,
    onType,
    typeOptions,
    shown,
    total,
}: DigestFeedFiltersProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <MicroSelect
            ariaLabel="Исход события"
            value={stack}
            options={[...FEED_STACK_OPTIONS]}
            onChange={onStack}
        />
        <MicroSelect
            ariaLabel="Тип события"
            value={typeCode}
            options={typeOptions}
            onChange={onType}
            className="max-w-56"
        />
        <span className="text-[0.6875rem] text-muted-foreground">
            {shown === total ? `${total} записей` : `${shown} из ${total}`}
        </span>
    </div>
);
