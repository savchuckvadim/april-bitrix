'use client';

import { FC } from 'react';
import type {
    CheckPresentationItem,
    CheckPresentationValue,
} from '../../type/check-presentation-type';
import {
    CheckPresentationField,
    type SurveyBlockHandlers,
} from './CheckPresentationField';

interface CheckPresentationFiveKProps extends SurveyBlockHandlers {
    items: CheckPresentationItem[];
    answers: Record<string, CheckPresentationValue>;
    missingIds: string[];
    onChange: (id: string, value: CheckPresentationValue) => void;
}

/**
 * Колонка «Пять К»: пять блоков-категорий, каждый со своими подвопросами.
 * Категорию называет заголовок блока — отдельных полос-разделителей нет с
 * переделки 01.09.2026, когда подвопросы ушли внутрь блока.
 */
export const CheckPresentationFiveK: FC<CheckPresentationFiveKProps> = ({
    items,
    answers,
    missingIds,
    onChange,
    ...blockHandlers
}) => (
    <div className="space-y-3">
        {items.map(item => (
            <CheckPresentationField
                key={item.id}
                item={item}
                value={answers[item.id]}
                isMissing={missingIds.includes(item.id)}
                onChange={value => onChange(item.id, value)}
                {...blockHandlers}
            />
        ))}
    </div>
);
