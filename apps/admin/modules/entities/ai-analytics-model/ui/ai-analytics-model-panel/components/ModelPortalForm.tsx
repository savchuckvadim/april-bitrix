'use client';

import { FieldCombobox } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { MODEL_TEXT } from '../../../consts/ai-analytics-model.const';
import type { AiAnalyticsModelPanelState } from '../hooks/use-ai-analytics-model-panel';

interface ModelPortalFormProps {
    form: AiAnalyticsModelPanelState['form'];
    actions: AiAnalyticsModelPanelState['actions'];
}

/** Выбор портала и периода сводки обратной связи. */
export const ModelPortalForm = ({ form, actions }: ModelPortalFormProps) => (
    <SectionCard title={MODEL_TEXT.formTitle} description={MODEL_TEXT.formDescription}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <FieldCombobox
                id="model-domain"
                label={MODEL_TEXT.portal}
                options={form.portalOptions}
                value={form.domain}
                onChange={actions.selectDomain}
                placeholder={MODEL_TEXT.portalPlaceholder}
                searchPlaceholder={MODEL_TEXT.portalSearch}
                emptyText={MODEL_TEXT.portalEmpty}
            />
            <div className="space-y-1.5">
                <Label htmlFor="model-feedback-from" className="text-xs font-semibold">
                    {MODEL_TEXT.periodFrom}
                </Label>
                <Input
                    id="model-feedback-from"
                    type="date"
                    value={form.period.from}
                    aria-invalid={!form.isPeriodValid}
                    onChange={event => actions.setFrom(event.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="model-feedback-to" className="text-xs font-semibold">
                    {MODEL_TEXT.periodTo}
                </Label>
                <Input
                    id="model-feedback-to"
                    type="date"
                    value={form.period.to}
                    aria-invalid={!form.isPeriodValid}
                    onChange={event => actions.setTo(event.target.value)}
                />
            </div>
        </div>
        <p
            className={
                form.isPeriodValid
                    ? 'mt-2 text-xs text-muted-foreground'
                    : 'mt-2 text-xs text-destructive'
            }
        >
            {form.isPeriodValid ? MODEL_TEXT.periodHint : MODEL_TEXT.periodInvalid}
        </p>
    </SectionCard>
);
