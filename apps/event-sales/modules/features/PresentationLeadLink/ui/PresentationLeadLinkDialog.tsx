'use client';

import { FC } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { LeadRequestEnumField } from '@/modules/features/LeadRequestCard/ui/LeadRequestEnumField';
import { LEAD_REQUEST_ENUM_LABEL } from '@/modules/features/LeadRequestCard/consts/lead-request.const';
import { presentationLeadLinkActions } from '../model/PresentationLeadLinkSlice';
import {
    closePresentationLeadLink,
    confirmPresentationLeadLink,
    selectPresentationLeadCandidate,
} from '../model/PresentationLeadLinkThunk';
import { usePresentationLeadLinkForm } from '../lib/hooks/use-presentation-lead-link-form';
import { PRESENTATION_LEAD_LINK_TEXT } from '../consts/presentation-lead-link.const';

/**
 * Обязательный вопрос перед отправкой отчёта с фактом презентации:
 * с какой открытой заявкой она связана (или «не связана»). При выборе
 * заявки статусы обязательны — без них отправка не продолжится.
 */
export const PresentationLeadLinkDialog: FC = () => {
    const dispatch = useAppDispatch();
    const form = usePresentationLeadLinkForm();

    if (!form.isOpen) return null;

    return (
        <Dialog
            open={form.isOpen}
            onOpenChange={open => !open && dispatch(closePresentationLeadLink())}
        >
            <DialogContent className="max-h-[85svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {PRESENTATION_LEAD_LINK_TEXT.title}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        {PRESENTATION_LEAD_LINK_TEXT.hint}
                    </p>

                    {form.candidatesStatus === 'loading' && (
                        <p className="text-sm text-muted-foreground">
                            {PRESENTATION_LEAD_LINK_TEXT.loading}
                        </p>
                    )}

                    <ul className="space-y-1.5">
                        {form.candidates.map(candidate => (
                            <li key={candidate.id}>
                                <button
                                    type="button"
                                    className={cn(
                                        'w-full rounded-md border px-2 py-1.5 text-left text-sm',
                                        form.selectedLeadId === candidate.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:bg-muted/40',
                                    )}
                                    onClick={() =>
                                        dispatch(
                                            selectPresentationLeadCandidate(
                                                candidate.id,
                                            ),
                                        )
                                    }
                                >
                                    <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                        {candidate.isRequest
                                            ? PRESENTATION_LEAD_LINK_TEXT.requestBadge
                                            : PRESENTATION_LEAD_LINK_TEXT.leadBadge}
                                    </span>
                                    {candidate.title}
                                    {candidate.responsibleName && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {candidate.responsibleName}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                type="button"
                                className={cn(
                                    'w-full rounded-md border px-2 py-1.5 text-left text-sm',
                                    form.noLink
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:bg-muted/40',
                                )}
                                onClick={() =>
                                    dispatch(
                                        presentationLeadLinkActions.noLinkSelected(),
                                    )
                                }
                            >
                                {PRESENTATION_LEAD_LINK_TEXT.noLinkOption}
                            </button>
                        </li>
                    </ul>

                    {form.selectedLeadId !== null && (
                        <div className="space-y-2 rounded-md border border-border p-2">
                            <p className="text-xs font-medium">
                                {PRESENTATION_LEAD_LINK_TEXT.statusesTitle}
                            </p>
                            {form.cardStatus === 'loading' && (
                                <p className="text-xs text-muted-foreground">
                                    {PRESENTATION_LEAD_LINK_TEXT.loading}
                                </p>
                            )}
                            {form.cardStatus === 'error' && (
                                <p className="text-xs text-destructive">
                                    {PRESENTATION_LEAD_LINK_TEXT.cardError}
                                </p>
                            )}
                            {form.card && (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <LeadRequestEnumField
                                        label={
                                            LEAD_REQUEST_ENUM_LABEL.siteStatusCode
                                        }
                                        installed={form.card.siteStatus.installed}
                                        currentCode={form.siteStatusCode}
                                        items={form.card.siteStatus.items}
                                        disabled={false}
                                        onChange={code =>
                                            dispatch(
                                                presentationLeadLinkActions.setSiteStatusCode(
                                                    code,
                                                ),
                                            )
                                        }
                                    />
                                    <LeadRequestEnumField
                                        label={
                                            LEAD_REQUEST_ENUM_LABEL.siteStageCode
                                        }
                                        installed={form.card.siteStage.installed}
                                        currentCode={form.siteStageCode}
                                        items={form.card.siteStage.items}
                                        disabled={false}
                                        onChange={code =>
                                            dispatch(
                                                presentationLeadLinkActions.setSiteStageCode(
                                                    code,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                            )}
                            {form.statusesMissing && (
                                <p className="text-xs text-destructive">
                                    {PRESENTATION_LEAD_LINK_TEXT.statusesMissing}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => dispatch(closePresentationLeadLink())}
                        >
                            {PRESENTATION_LEAD_LINK_TEXT.cancelButton}
                        </Button>
                        <Button
                            disabled={!form.canConfirm}
                            onClick={() =>
                                dispatch(confirmPresentationLeadLink())
                            }
                        >
                            {PRESENTATION_LEAD_LINK_TEXT.confirmButton}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PresentationLeadLinkDialog;
