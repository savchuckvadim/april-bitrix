'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireFieldSourceOption } from '../../../lib/field-picker-view';

interface QuestionnaireFieldPickerFiltersProps {
    /** Носители с пометкой: чьи поля анкете сейчас доступны. */
    sources: QuestionnaireFieldSourceOption[];
    sourceKey: string;
    search: string;
    onlyManual: boolean;
    onSelectSource: (key: string) => void;
    onSearchChange: (value: string) => void;
    onOnlyManualChange: (value: boolean) => void;
}

/**
 * Носитель и фильтры списка полей.
 *
 * Носитель — единственный параметр, который стоит запроса в Битрикс:
 * поиск и «только созданные вручную» считаются на уже загруженном списке,
 * поэтому переключаются мгновенно.
 */
export const QuestionnaireFieldPickerFilters = ({
    sources,
    sourceKey,
    search,
    onlyManual,
    onSelectSource,
    onSearchChange,
    onOnlyManualChange,
}: QuestionnaireFieldPickerFiltersProps) => (
    <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
            <Select value={sourceKey} onValueChange={onSelectSource}>
                <SelectTrigger className="w-64">
                    <SelectValue
                        placeholder={QUESTIONNAIRE_EDITOR_TEXT.pickerSource}
                    />
                </SelectTrigger>
                <SelectContent>
                    {/* Недоступный носитель из списка не убираем: его поля
                        владелец завёл сам и искал бы пропажу. Пометка
                        отвечает на вопрос «чьи поля мне сейчас доступны»,
                        а причина написана плашкой над списком полей. */}
                    {sources.map(source => (
                        <SelectItem
                            key={source.key}
                            value={source.key}
                            title={source.blockReason ?? undefined}
                        >
                            {source.blockReason
                                ? `${source.title} — ${QUESTIONNAIRE_EDITOR_TEXT.pickerSourceBlocked}`
                                : source.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                className="w-64"
                placeholder={QUESTIONNAIRE_EDITOR_TEXT.pickerSearch}
                value={search}
                onChange={event => onSearchChange(event.target.value)}
            />

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={onlyManual}
                    onCheckedChange={checked =>
                        onOnlyManualChange(checked === true)
                    }
                />
                {QUESTIONNAIRE_EDITOR_TEXT.pickerOnlyManual}
            </label>
        </div>

        <p className="text-xs text-muted-foreground">
            {QUESTIONNAIRE_EDITOR_TEXT.pickerSourceHint}
        </p>
    </div>
);
