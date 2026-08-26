'use client';

import { FC, Fragment } from 'react';
import { getFiveKGroup } from '../../lib/check-presentation.groups';
import type {
    CheckPresentationItem,
    CheckPresentationValue,
} from '../../type/check-presentation-type';
import { CheckPresentationField } from './CheckPresentationField';

interface CheckPresentationFiveKProps {
    items: CheckPresentationItem[];
    answers: Record<string, CheckPresentationValue>;
    missingIds: string[];
    onChange: (id: string, value: CheckPresentationValue) => void;
}

/**
 * Колонка «Пять К»: вопросы с тонкими полосами-разделителями категорий.
 *
 * Категория написана один раз на полосе, а не в каждом лейбле («КЛИЕНТ: …»
 * двадцать раз подряд читались как шум).
 */
export const CheckPresentationFiveK: FC<CheckPresentationFiveKProps> = ({
    items,
    answers,
    missingIds,
    onChange,
}) => (
    <div className="space-y-3">
        {items.map((item, index) => {
            const group = getFiveKGroup(item.code);
            const prevCode = items[index - 1]?.code;
            const prevGroup = prevCode ? getFiveKGroup(prevCode) : null;
            return (
                <Fragment key={item.id}>
                    {group && group !== prevGroup && (
                        <div
                            className="flex items-center gap-2 pt-1"
                            aria-hidden
                        >
                            <span className="text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
                                {group}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                        </div>
                    )}
                    <CheckPresentationField
                        item={item}
                        value={answers[item.id]}
                        isMissing={missingIds.includes(item.id)}
                        onChange={value => onChange(item.id, value)}
                    />
                </Fragment>
            );
        })}
    </div>
);
