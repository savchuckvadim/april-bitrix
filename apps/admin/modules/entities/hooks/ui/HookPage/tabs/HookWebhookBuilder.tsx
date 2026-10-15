'use client';

import { useMemo, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    EVENT_SALES_PUBLIC_URL,
    HOOK_SELECT_NONE_VALUE,
    HOOKS_TEXT,
} from '../../../consts/hooks.const';
import {
    buildWebhookUrl,
    initialWebhookValues,
    isRobotQueryParam,
    parseParamOptions,
} from '../../../lib/webhook-url';
import type { HookEndpoint, HookParam } from '../../../model';
import { HookCodeBlock } from '../../components/HookCodeBlock';

interface HookWebhookBuilderProps {
    endpoints: HookEndpoint[];
    params: HookParam[];
}

interface ParamInputProps {
    param: HookParam;
    value: string;
    onChange: (value: string) => void;
}

/** Поле параметра: справочник значений — селект, иначе свободный ввод. */
const ParamInput = ({ param, value, onChange }: ParamInputProps) => {
    const options = parseParamOptions(param.values);
    const id = `hook-param-${param.name}`;

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
                <Label htmlFor={id} className="font-mono text-xs">
                    {param.name}
                    {param.required && <span className="text-destructive"> *</span>}
                </Label>
                {param.default && (
                    <span className="text-[11px] text-muted-foreground">
                        {HOOKS_TEXT.builderDefaultHint}: {param.default}
                    </span>
                )}
            </div>
            {options ? (
                <Select
                    value={value || HOOK_SELECT_NONE_VALUE}
                    onValueChange={next =>
                        onChange(next === HOOK_SELECT_NONE_VALUE ? '' : next)
                    }
                >
                    <SelectTrigger id={id} className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={HOOK_SELECT_NONE_VALUE}>
                            {HOOKS_TEXT.builderNone}
                        </SelectItem>
                        {options.map(option => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    id={id}
                    value={value}
                    placeholder={
                        param.values
                            ? `${HOOKS_TEXT.builderFreeHint}: ${param.values}`
                            : HOOKS_TEXT.builderNone
                    }
                    onChange={event => onChange(event.target.value)}
                />
            )}
            <p className="text-[11px] leading-snug text-muted-foreground">
                {param.description}
            </p>
        </div>
    );
};

/**
 * Конструктор адреса для робота: значения query-параметров (без /run-only)
 * → готовый адрес вебхука на публичном хосте event-sales. Подстановки
 * Битрикса `{{ID}}` не кодируются — их заменяет сам Битрикс.
 */
export const HookWebhookBuilder = ({
    endpoints,
    params,
}: HookWebhookBuilderProps) => {
    const webhooks = useMemo(
        () => endpoints.filter(endpoint => endpoint.kind === 'webhook'),
        [endpoints],
    );
    const robotParams = useMemo(() => params.filter(isRobotQueryParam), [params]);
    const [path, setPath] = useState(webhooks[0]?.path ?? '');
    const [values, setValues] = useState<Record<string, string>>(() =>
        initialWebhookValues(params),
    );

    if (webhooks.length === 0) return null;

    const url = buildWebhookUrl(EVENT_SALES_PUBLIC_URL, path, values);

    return (
        <SectionCard
            title={HOOKS_TEXT.builderTitle}
            description={HOOKS_TEXT.builderDescription}
        >
            <div className="space-y-4">
                {webhooks.length > 1 && (
                    <div className="space-y-1">
                        <Label htmlFor="hook-builder-endpoint">
                            {HOOKS_TEXT.builderEndpoint}
                        </Label>
                        <Select value={path} onValueChange={setPath}>
                            <SelectTrigger
                                id="hook-builder-endpoint"
                                className="w-full max-w-xl"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {webhooks.map(endpoint => (
                                    <SelectItem
                                        key={endpoint.path}
                                        value={endpoint.path}
                                    >
                                        {endpoint.path}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {robotParams.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {robotParams.map(param => (
                            <ParamInput
                                key={param.name}
                                param={param}
                                value={values[param.name] ?? ''}
                                onChange={value =>
                                    setValues(current => ({
                                        ...current,
                                        [param.name]: value,
                                    }))
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {HOOKS_TEXT.paramsEmpty}
                    </p>
                )}

                <HookCodeBlock value={url} label={HOOKS_TEXT.builderResult} />
                <p className="text-xs text-muted-foreground">
                    {HOOKS_TEXT.builderMethodHint}
                </p>
            </div>
        </SectionCard>
    );
};
