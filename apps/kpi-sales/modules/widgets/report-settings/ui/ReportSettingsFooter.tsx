'use client';

import { Button } from '@workspace/ui/components/button';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

const T = REPORT_SETTINGS_TEXT.footer;

interface ReportSettingsFooterProps {
    /** Есть что сохранять. */
    dirty: boolean;
    saving: boolean;
    /** Только что сохранено и с тех пор форму не меняли. */
    saved: boolean;
    /** Понятный текст ошибки последнего сохранения. */
    error: string | null;
    /** «Последнее изменение: …»; null — настройки ещё не менялись. */
    lastChange: string | null;
    onSave: () => void;
}

/** Низ страницы: «Сохранить», итог сохранения, для кого действуют изменения и кто менял последним. */
export const ReportSettingsFooter = ({
    dirty,
    saving,
    saved,
    error,
    lastChange,
    onSave,
}: ReportSettingsFooterProps) => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onSave} disabled={!dirty || saving}>
                {saving ? T.saving : T.save}
            </Button>
            {error ? (
                <span role="alert" className="text-sm text-destructive">
                    {error}
                </span>
            ) : (
                saved &&
                !dirty && (
                    <span role="status" className="text-sm text-success">
                        {T.saved}
                    </span>
                )
            )}
        </div>
        <p className="text-xs text-muted-foreground">{T.audience}</p>
        {lastChange && <p className="text-xs text-muted-foreground">{lastChange}</p>}
    </div>
);
