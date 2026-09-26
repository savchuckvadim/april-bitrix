'use client';

import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui';

interface AiSettingsRosterTabProps {
    /** settings/get загружены — дата ниже достоверна. */
    loaded: boolean;
    /** Текущая дата подтверждения из настроек; null — состав не подтверждён. */
    current: string | null;
    /** Что уйдёт при сохранении: дата — подтвердить, '' — снять, null — не трогали. */
    pending: string | null;
    today: string;
    disabled: boolean;
    onConfirm: () => void;
    onClear: () => void;
    onReset: () => void;
}

const statusBadge = (loaded: boolean, current: string | null) => {
    if (!loaded) {
        return (
            <ToneBadge tone="muted" variant="soft" size="sm">
                настройки ещё не загружены
            </ToneBadge>
        );
    }
    return current ? (
        <ToneBadge tone="success" variant="soft" size="sm">
            состав подтверждён {current}
        </ToneBadge>
    ) : (
        <ToneBadge tone="warning" variant="soft" size="sm">
            состав не подтверждён
        </ToneBadge>
    );
};

const pendingLine = (pending: string | null): string | null => {
    if (pending === null) return null;
    return pending === ''
        ? 'После сохранения подтверждение будет снято.'
        : `После сохранения состав будет подтверждён на ${pending}.`;
};

/** Вкладка «Состав»: дата подтверждения и кнопка «Подтвердить состав». */
export const AiSettingsRosterTab = ({
    loaded,
    current,
    pending,
    today,
    disabled,
    onConfirm,
    onClear,
    onReset,
}: AiSettingsRosterTabProps) => (
    <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
            Подтверждение означает, что список менеджеров и их уровни актуальны
            — это одно из условий выхода витрины в режим норм. Дата пишется в
            настройки портала (rosterConfirmedAt).
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Сейчас:</span>
            {statusBadge(loaded, current)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button
                size="sm"
                className="h-7 text-xs"
                disabled={
                    disabled ||
                    pending === today ||
                    (pending === null && current === today)
                }
                onClick={onConfirm}
            >
                Подтвердить состав на сегодня ({today})
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={
                    disabled ||
                    pending === '' ||
                    (pending === null && current === null)
                }
                onClick={onClear}
            >
                Снять подтверждение
            </Button>
            {pending !== null && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={disabled}
                    onClick={onReset}
                >
                    Отменить изменение
                </Button>
            )}
        </div>
        {pendingLine(pending) && (
            <p className="text-xs font-medium">{pendingLine(pending)}</p>
        )}
    </div>
);
