'use client';

import { FC, useState } from 'react';
import { APRIL_BOOT_LOGO_SVG } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';
import { useLeadConfirmGate } from '../lib/hooks/use-lead-confirm-gate';
import { useSlaCountdown } from '../lib/hooks/use-sla-countdown';
import { acceptLeadRequest } from '../model/LeadRequestThunk';
import { LeadTransferDialog } from './LeadTransferDialog';

/**
 * Экран подтверждения заявки — первое, что видно при открытии приложения.
 *
 * Заявка, назначенная и не принятая, живёт по SLA: не подтвердил за час —
 * уходит другому. Раньше об этом сообщал блок ВНУТРИ карточки, ниже дел и
 * связей: его пролистывали, час тикал, заявка уезжала. Поэтому теперь это
 * экран: имя клиента и два действия, всё остальное закрыто.
 *
 * «Пропустить» оставлено намеренно: иногда до решения нужно посмотреть дубли
 * или историю — запирать человека в экране значит заставлять его врать
 * кнопкой «Взять». Пропуск не принимает заявку и не гасит SLA, он только
 * убирает экран до перезагрузки, и работа остаётся заблокированной ниже по
 * форме (sendBlockedByAccept).
 */
export const LeadConfirmGate: FC = () => {
    const dispatch = useAppDispatch();
    const gate = useLeadConfirmGate();
    const sla = useSlaCountdown(gate.currentLeadId);
    const saving = useAppSelector(state => state.leadRequest.saving);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    if (!gate.isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background p-6">
            {/* Знак April фоном — тот же, что на загрузке: экран читается как
                часть приложения, а не как ошибка. */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground/10 [&>svg]:h-[70vmin] [&>svg]:w-[70vmin]"
                dangerouslySetInnerHTML={{ __html: APRIL_BOOT_LOGO_SVG }}
            />

            <div className="relative flex flex-col items-center gap-1 text-center">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    {LEAD_REQUEST_TEXT.notAcceptedTitle}
                </p>
                <h1 className="max-w-xl text-xl font-semibold text-balance">
                    {gate.clientTitle}
                </h1>
                {gate.pendingAfter > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {`И ещё ${gate.pendingAfter} ждёт решения — покажем по одной`}
                    </p>
                )}
                <p className="max-w-md text-sm text-muted-foreground">
                    {LEAD_REQUEST_TEXT.gateHint}
                </p>
                {/* Живой срок вместо абстрактного «часа»: цифра из того же
                    поля, по которому крон забирает заявку. */}
                {sla && (
                    <p
                        className={
                            sla.isOverdue
                                ? 'text-sm font-semibold text-destructive'
                                : 'text-sm font-medium text-warning'
                        }
                    >
                        {sla.isOverdue
                            ? 'Срок вышел — заявку может забрать система'
                            : `Осталось ≈ ${sla.minutesLeft} мин`}
                    </p>
                )}
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-2">
                <Button
                    size="lg"
                    disabled={saving}
                    onClick={() => dispatch(acceptLeadRequest())}
                >
                    {LEAD_REQUEST_TEXT.acceptButton}
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setIsTransferOpen(true)}
                >
                    {LEAD_REQUEST_TEXT.transferButton}
                </Button>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="relative text-xs text-muted-foreground"
                onClick={gate.skip}
            >
                {LEAD_REQUEST_TEXT.gateSkip}
            </Button>

            <LeadTransferDialog
                open={isTransferOpen}
                onOpenChange={setIsTransferOpen}
            />
        </div>
    );
};
