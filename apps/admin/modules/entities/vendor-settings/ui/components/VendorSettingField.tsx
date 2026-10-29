'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useSaveVendorSetting } from '../../lib/hooks/use-vendor-settings';
import {
    VENDOR_SETTINGS_TEXT,
    VENDOR_SOURCE_LABELS,
    type VendorSetting,
    type VendorSourceTone,
} from '../../model';

interface VendorSettingFieldProps {
    setting: VendorSetting;
    /** Маска сохранённого секрета с бэка; отправить её = оставить прежнее. */
    secretMask: string;
}

const BADGE_VARIANT: Record<VendorSourceTone, 'default' | 'secondary' | 'destructive'> =
    {
        ok: 'default',
        muted: 'secondary',
        warn: 'destructive',
    };

/**
 * Одна настройка: название, что делает, «где взять», поле ввода и кнопки.
 * Секрет показывается маской и вводится скрыто; «Очистить» снимает
 * значение из админки — снова действует переменная окружения.
 */
export function VendorSettingField({ setting, secretMask }: VendorSettingFieldProps) {
    const save = useSaveVendorSetting();
    const initial = setting.secret
        ? setting.isSet
            ? secretMask
            : ''
        : (setting.value ?? '');
    const [draft, setDraft] = React.useState(initial);
    React.useEffect(() => {
        setDraft(initial);
    }, [initial]);

    const dirty = draft !== initial;
    const source = VENDOR_SOURCE_LABELS[setting.source];
    const inputId = `vendor-setting-${setting.key}`;

    return (
        <div className="space-y-2 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={inputId} className="text-base font-medium">
                    {setting.label}
                </Label>
                <Badge variant={BADGE_VARIANT[source.tone]}>{source.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{setting.description}</p>
            <details className="text-sm">
                <summary className="cursor-pointer text-primary">
                    {VENDOR_SETTINGS_TEXT.howTo}
                </summary>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">
                    {setting.howTo}
                </p>
            </details>
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    id={inputId}
                    type={setting.secret ? 'password' : 'text'}
                    value={draft}
                    placeholder={setting.example}
                    autoComplete="off"
                    className="max-w-xl"
                    onChange={(event) => setDraft(event.target.value)}
                />
                <Button
                    size="sm"
                    disabled={!dirty || save.isPending}
                    onClick={() =>
                        save.mutate({ key: setting.key, value: draft.trim() || null })
                    }
                >
                    {VENDOR_SETTINGS_TEXT.save}
                </Button>
                {setting.isSet && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={save.isPending}
                        onClick={() => save.mutate({ key: setting.key, value: null })}
                    >
                        {VENDOR_SETTINGS_TEXT.reset}
                    </Button>
                )}
            </div>
            <p className="text-xs text-muted-foreground/80">
                {setting.secret && setting.isSet ? `${VENDOR_SETTINGS_TEXT.keepSecret} ` : ''}
                {setting.envSet ? VENDOR_SETTINGS_TEXT.envFallback : VENDOR_SETTINGS_TEXT.noEnv}
                {setting.updatedAt
                    ? ` ${VENDOR_SETTINGS_TEXT.updatedAt(setting.updatedAt, setting.updatedBy)}`
                    : ''}
            </p>
        </div>
    );
}
