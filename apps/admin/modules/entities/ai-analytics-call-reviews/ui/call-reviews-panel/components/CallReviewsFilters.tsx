'use client';

import { FieldCombobox, SelectField } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    AGREE_OPTIONS,
    CALL_REVIEWS_TEXT,
    ITEM_KIND_OPTIONS,
} from '../../../consts/call-reviews.const';
import type { CallReviewsPanelState } from '../hooks/use-call-reviews-panel';

interface CallReviewsFiltersProps {
    form: CallReviewsPanelState['form'];
    actions: CallReviewsPanelState['actions'];
}

/** Портал, период и фильтры списка отзывов. */
export const CallReviewsFilters = ({ form, actions }: CallReviewsFiltersProps) => (
    <SectionCard title={CALL_REVIEWS_TEXT.formTitle} description={CALL_REVIEWS_TEXT.pageDescription}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <FieldCombobox
                id="call-reviews-domain"
                label={CALL_REVIEWS_TEXT.portal}
                options={form.portalOptions}
                value={form.filters.domain}
                onChange={actions.selectDomain}
                placeholder={CALL_REVIEWS_TEXT.portalPlaceholder}
                searchPlaceholder={CALL_REVIEWS_TEXT.portalSearch}
                emptyText={CALL_REVIEWS_TEXT.portalEmpty}
            />
            <div className="space-y-1.5">
                <Label htmlFor="call-reviews-from" className="text-xs font-semibold">
                    {CALL_REVIEWS_TEXT.periodFrom}
                </Label>
                <Input
                    id="call-reviews-from"
                    type="date"
                    value={form.filters.period.from}
                    aria-invalid={!form.isPeriodValid}
                    onChange={event => actions.setFrom(event.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="call-reviews-to" className="text-xs font-semibold">
                    {CALL_REVIEWS_TEXT.periodTo}
                </Label>
                <Input
                    id="call-reviews-to"
                    type="date"
                    value={form.filters.period.to}
                    aria-invalid={!form.isPeriodValid}
                    onChange={event => actions.setTo(event.target.value)}
                />
            </div>
            <SelectField
                id="call-reviews-agree"
                label={CALL_REVIEWS_TEXT.agree}
                options={AGREE_OPTIONS}
                value={form.filters.agree}
                onChange={actions.setAgree}
            />
            <SelectField
                id="call-reviews-item-kind"
                label={CALL_REVIEWS_TEXT.itemKind}
                options={ITEM_KIND_OPTIONS}
                value={form.filters.itemKind}
                onChange={actions.setItemKind}
            />
        </div>
        {!form.isPeriodValid && (
            <p className="mt-2 text-xs text-destructive">{CALL_REVIEWS_TEXT.periodInvalid}</p>
        )}
    </SectionCard>
);
