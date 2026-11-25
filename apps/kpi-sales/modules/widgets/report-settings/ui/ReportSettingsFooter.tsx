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

/**
 * Низ страницы. Строка сохранения прилипает к низу окна: список бейджей
 * длинный, а «Сохранить» должна быть под рукой на любой прокрутке. В строке —
 * кнопка и итог сохранения, а пока итога нет — для кого действуют изменения.
 * Ниже, уже в потоке страницы, — кто менял последним.
 *
 * Корня-обёртки нет намеренно: прилипание работает в пределах родителя, и
 * строка должна быть прямым потомком колонки формы.
 */
export const ReportSettingsFooter = ({
    dirty,
    saving,
    saved,
    error,
    lastChange,
    onSave,
}: ReportSettingsFooterProps) => (
    <>
        <div className="sticky bottom-0 z-[5] flex flex-wrap items-center gap-3 border-t bg-background/95 py-3 backdrop-blur-sm">
            <Button onClick={onSave} disabled={!dirty || saving}>
                {saving ? T.saving : T.save}
            </Button>
            {error ? (
                <span role="alert" className="text-sm text-destructive">
                    {error}
                </span>
            ) : saved && !dirty ? (
                <span role="status" className="text-sm text-success">
                    {T.saved}
                </span>
            ) : (
                <span className="text-xs text-muted-foreground">{T.audience}</span>
            )}
        </div>
        {lastChange && <p className="text-xs text-muted-foreground">{lastChange}</p>}
    </>
);
