'use client';

import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import {
    AUDIT_TEXT,
    AUDIT_TIME_ZONE_OPTIONS,
} from '../../../consts/ai-analytics-audit.const';
import { AI_ANALYTICS_AUDIT_RUN_DEFAULTS } from '../../../model';
import type { AuditFormActions, AuditFormState } from '../types';
import { MonthsField } from './MonthsField';

interface AuditRunParamsProps {
    form: AuditFormState;
    actions: AuditFormActions;
}

/**
 * Параметры расчёта: окно в месяцах, часовой пояс, признак снапшота.
 * Рендерятся ячейками сетки формы — обёртки нет намеренно.
 */
export const AuditRunParams = ({ form, actions }: AuditRunParamsProps) => (
    <>
        <MonthsField
            id="audit-months"
            label={AUDIT_TEXT.months}
            value={form.monthsRaw}
            isValid={form.isMonthsValid}
            min={AI_ANALYTICS_AUDIT_RUN_DEFAULTS.minMonths}
            max={AI_ANALYTICS_AUDIT_RUN_DEFAULTS.maxMonths}
            hint={AUDIT_TEXT.monthsHint}
            invalidHint={AUDIT_TEXT.monthsInvalid}
            onChange={actions.setMonthsRaw}
        />

        <div className="space-y-1.5">
            <Label htmlFor="audit-time-zone" className="text-xs font-semibold">
                {AUDIT_TEXT.timeZone}
            </Label>
            <Select value={form.timeZone} onValueChange={actions.setTimeZone}>
                <SelectTrigger id="audit-time-zone" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {AUDIT_TIME_ZONE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-1.5">
            <Label htmlFor="audit-save" className="text-xs font-semibold">
                {AUDIT_TEXT.save}
            </Label>
            <div className="flex h-9 items-center gap-3">
                <Switch
                    id="audit-save"
                    checked={form.save}
                    onCheckedChange={actions.setSave}
                />
                <span className="text-xs text-muted-foreground">
                    {AUDIT_TEXT.saveHint}
                </span>
            </div>
        </div>
    </>
);
