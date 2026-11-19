'use client';

import { MicroField, MicroSelect } from '@workspace/april-ui/fields';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';
import {
    callsListScoreOptions,
    scoreOfOption,
    scoreOptionValue,
} from '../../lib/calls-list-filter-options';

const T = CALLS_LIST_TEXT.filters;

interface CallsListScoreFilterProps {
    scoreMin: number | null;
    scoreMax: number | null;
    onChange: (range: { scoreMin: number | null; scoreMax: number | null }) => void;
}

/** Оценка AI «от — до» по шкале 1–10; «любая» — без границы. */
export const CallsListScoreFilter = ({
    scoreMin,
    scoreMax,
    onChange,
}: CallsListScoreFilterProps) => (
    <MicroField label={T.score}>
        <MicroSelect
            ariaLabel={T.scoreFrom}
            value={scoreOptionValue(scoreMin)}
            options={callsListScoreOptions(scoreMin)}
            className="h-7 text-xs"
            onChange={value => onChange({ scoreMin: scoreOfOption(value), scoreMax })}
        />
        <span aria-hidden className="text-xs text-muted-foreground">
            —
        </span>
        <MicroSelect
            ariaLabel={T.scoreTo}
            value={scoreOptionValue(scoreMax)}
            options={callsListScoreOptions(scoreMax)}
            className="h-7 text-xs"
            onChange={value => onChange({ scoreMin, scoreMax: scoreOfOption(value) })}
        />
    </MicroField>
);
