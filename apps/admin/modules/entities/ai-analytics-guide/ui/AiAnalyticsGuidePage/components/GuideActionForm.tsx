'use client';

import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ConfirmDialog } from '@/modules/shared';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { GUIDE_TEXT } from '../../../consts/ai-analytics-guide.const';
import {
    buildActionPayload,
    defaultActionValues,
    GUIDE_ACTIONS,
    type GuideActionCode,
    type GuideActionField,
    type GuideFormValues,
} from '../../../lib/guide-actions';
import { useRunGuideAction } from '../../../lib/hooks';
import { buildSwaggerHint, formatJson } from '../../../lib/guide-view';
import type { GuideEndpoint } from '../../../model';
import { GuideCodeBlock } from '../../components/GuideCodeBlock';
import { GuideNotice } from '../../components/GuideNotice';

interface GuideActionFormProps {
    action: GuideActionCode;
    endpoint: GuideEndpoint;
    domain: string | undefined;
}

const INPUT_TYPE: Record<string, string> = {
    month: 'month',
    date: 'date',
    number: 'number',
    text: 'text',
    csv: 'text',
};

const Field = ({
    field,
    value,
    onChange,
}: {
    field: GuideActionField;
    value: string | boolean;
    onChange: (value: string | boolean) => void;
}) => {
    const id = `guide-field-${field.name}`;
    if (field.kind === 'checkbox') {
        return (
            <div className="flex items-center gap-2">
                <Checkbox
                    id={id}
                    checked={value === true}
                    onCheckedChange={checked => onChange(checked === true)}
                />
                <Label htmlFor={id}>{field.label}</Label>
            </div>
        );
    }
    if (field.kind === 'select') {
        return (
            <div className="space-y-1">
                <Label htmlFor={id}>{field.label}</Label>
                <Select value={String(value)} onValueChange={onChange}>
                    <SelectTrigger id={id}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(field.options ?? []).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
                id={id}
                type={INPUT_TYPE[field.kind] ?? 'text'}
                value={String(value)}
                placeholder={field.placeholder}
                onChange={event => onChange(event.target.value)}
            />
            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
        </div>
    );
};

/**
 * Форма действия «Запуск»: поля по спецификации действия, кнопка с
 * подтверждением (для admin-ручек), ответ в JSON-карточке. Для ручек
 * других приложений — Swagger-подсказка и готовое тело с подставленными
 * значениями (копируется кнопкой).
 */
export const GuideActionForm = ({ action, endpoint, domain }: GuideActionFormProps) => {
    const spec = GUIDE_ACTIONS[action];
    const [values, setValues] = useState<GuideFormValues>(() => defaultActionValues(action));
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const run = useRunGuideAction();

    // Смена портала — чужой ответ не должен висеть под формой.
    useEffect(() => {
        run.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain]);

    const payload = domain ? buildActionPayload(action, domain, values) : null;
    const payloadError = typeof payload === 'string' ? payload : null;

    const start = () => {
        if (!domain) {
            setFormError(GUIDE_TEXT.noPortalForRun);
            return;
        }
        if (!payload || typeof payload === 'string') {
            setFormError(payload ?? GUIDE_TEXT.noPortalForRun);
            return;
        }
        setFormError(null);
        if (spec.method === 'POST') setConfirmOpen(true);
        else run.mutate(payload);
    };

    const confirm = () => {
        setConfirmOpen(false);
        if (payload && typeof payload !== 'string') run.mutate(payload);
    };

    const externalBody =
        payload && typeof payload !== 'string' && payload.kind === 'external'
            ? formatJson(payload.body)
            : null;

    return (
        <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <div>
                <p className="text-sm font-medium">{spec.title}</p>
                <p className="text-xs text-muted-foreground">{spec.description}</p>
            </div>
            {spec.fields.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {spec.fields.map(field => (
                        <Field
                            key={field.name}
                            field={field}
                            value={values[field.name] ?? (field.kind === 'checkbox' ? false : '')}
                            onChange={value =>
                                setValues(current => ({ ...current, [field.name]: value }))
                            }
                        />
                    ))}
                </div>
            )}

            {spec.external ? (
                <div className="space-y-2">
                    <GuideNotice
                        tone="info"
                        title={GUIDE_TEXT.externalTitle}
                        message={`${GUIDE_TEXT.externalHint} ${buildSwaggerHint(endpoint)}`}
                    />
                    {domain ? (
                        <GuideCodeBlock
                            label={GUIDE_TEXT.externalBody}
                            value={externalBody ?? payloadError ?? ''}
                        />
                    ) : (
                        <p className="text-xs text-muted-foreground">{GUIDE_TEXT.noPortalForRun}</p>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            size="sm"
                            disabled={!domain || run.isPending}
                            onClick={start}
                            title={domain ? undefined : GUIDE_TEXT.noPortalForRun}
                        >
                            {run.isPending ? GUIDE_TEXT.running : GUIDE_TEXT.run}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {endpoint.method} /api/{endpoint.path}
                            {domain ? ` · ${domain}` : ` · ${GUIDE_TEXT.noPortalForRun}`}
                        </span>
                    </div>
                    {(formError ?? payloadError) && domain && (
                        <GuideNotice tone="warning" message={formError ?? payloadError ?? ''} />
                    )}
                    {run.isError && (
                        <GuideNotice
                            tone="error"
                            title={GUIDE_TEXT.runError}
                            message={getApiErrorMessage(run.error)}
                        />
                    )}
                    {run.isSuccess && (
                        <GuideCodeBlock
                            label={GUIDE_TEXT.result}
                            value={formatJson(run.data) || GUIDE_TEXT.resultEmpty}
                            scroll
                        />
                    )}
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={GUIDE_TEXT.confirmTitle}
                description={`${spec.title}. ${GUIDE_TEXT.confirmDescription}`}
                onConfirm={confirm}
                confirmLabel={GUIDE_TEXT.confirm}
                cancelLabel={GUIDE_TEXT.cancel}
                isLoading={run.isPending}
            />
        </div>
    );
};
