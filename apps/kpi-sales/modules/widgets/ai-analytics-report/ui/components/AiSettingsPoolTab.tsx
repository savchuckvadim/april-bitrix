'use client';

import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui';
import { formatAiFullDate } from '@/modules/entities/ai-analytics';
import {
    AI_SETTINGS_PHASE4_HINT,
    AI_SETTINGS_POOL_CONSENT_TEXT,
    type AiSettingsPhase4State,
} from '../../lib/ai-settings-form.phase4';
import { AiTheoryLink } from './AiTheoryLink';

interface AiSettingsPoolTabProps {
    /**
     * ready — состояние ниже достоверно; loading — настройки грузятся;
     * outdated — старый сервер согласие на пул не принимает.
     */
    state: AiSettingsPhase4State;
    /** Текущее согласие из настроек. */
    optIn: boolean;
    /** Дата согласия из настроек; null — не задана. */
    consentAt: string | null;
    /** Что уйдёт при сохранении: true — дать, false — отозвать, null — не трогали. */
    pending: boolean | null;
    disabled: boolean;
    onGive: () => void;
    onRevoke: () => void;
    onReset: () => void;
}

const statusBadge = (
    state: AiSettingsPhase4State,
    optIn: boolean,
    consentAt: string | null,
) => {
    if (state !== 'ready') {
        return (
            <ToneBadge tone="muted" variant="soft" size="sm">
                {state === 'loading'
                    ? 'настройки ещё не загружены'
                    : 'недоступно'}
            </ToneBadge>
        );
    }
    return optIn ? (
        <ToneBadge tone="success" variant="soft" size="sm">
            {consentAt
                ? `участвует с ${formatAiFullDate(consentAt)}`
                : 'участвует'}
        </ToneBadge>
    ) : (
        <ToneBadge tone="muted" variant="soft" size="sm">
            не участвует
        </ToneBadge>
    );
};

const pendingLine = (pending: boolean | null): string | null => {
    if (pending === null) return null;
    return pending
        ? 'После сохранения портал начнёт участвовать в общей статистике.'
        : 'После сохранения согласие будет отозвано: портал выйдет из общей статистики.';
};

/** Вкладка «Пул порталов»: согласие на обезличенную общую статистику. */
export const AiSettingsPoolTab = ({
    state,
    optIn,
    consentAt,
    pending,
    disabled,
    onGive,
    onRevoke,
    onReset,
}: AiSettingsPoolTabProps) => {
    const willOptIn = pending ?? optIn;
    const loaded = state === 'ready';
    const hint = AI_SETTINGS_PHASE4_HINT[state];
    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
                {AI_SETTINGS_POOL_CONSENT_TEXT}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>Сейчас:</span>
                {statusBadge(state, optIn, consentAt)}
            </div>
            {state === 'outdated' && hint !== null && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={disabled || !loaded || willOptIn}
                    onClick={onGive}
                >
                    Дать согласие
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={disabled || !loaded || !willOptIn}
                    onClick={onRevoke}
                >
                    Отозвать
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
                <AiTheoryLink topic="pool" className="ml-auto" />
            </div>
            {pendingLine(pending) && (
                <p className="text-xs font-medium">{pendingLine(pending)}</p>
            )}
        </div>
    );
};
