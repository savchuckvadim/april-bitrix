'use client';

import { useState } from 'react';
import { AButton, SectionCard } from '@workspace/april-ui';
import {
    issueTelegramCode,
    listTelegramBindings,
    revokeTelegramBinding,
    type CabinetTelegramCode,
} from '@workspace/bitrix';
import { useCabinetAction, useCabinetLoad } from '../../lib/cabinet-hooks';
import { formatDateTime } from '../../lib/cabinet-texts';

/**
 * Telegram: отчёты и уведомления April приходят в личный чат. Привязка —
 * одноразовым кодом: кнопка → код → «/start КОД» боту (или ссылка, которая
 * откроет бота с кодом). Владелец видит все привязки портала.
 */
export const TelegramBlock = ({ portalId }: { portalId: number }) => {
    const bindings = useCabinetLoad(() => listTelegramBindings(portalId), [portalId]);
    const action = useCabinetAction();
    const [code, setCode] = useState<CabinetTelegramCode | null>(null);

    const issue = async () => {
        const result = await action.run(() => issueTelegramCode(portalId));
        if (result) setCode(result);
    };
    const revoke = async (bindingId: string) => {
        if (!window.confirm('Отвязать этот Telegram? Уведомления перестанут приходить.')) return;
        const result = await action.run(() => revokeTelegramBinding(portalId, bindingId));
        if (result) bindings.reload();
    };

    return (
        <SectionCard
            title="Telegram"
            description="Отчёты и уведомления April — в личный Telegram. Чат привязывается к вам на этом портале."
        >
            <div className="flex flex-col gap-3">
                {code ? (
                    <div className="flex flex-col gap-2 rounded-md border border-dashed p-3 text-sm">
                        <p>
                            Код: <b className="font-mono text-base">{code.code}</b> — действует до{' '}
                            {formatDateTime(code.expiresAt)}.
                        </p>
                        {code.deepLink ? (
                            <a
                                href={code.deepLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                            >
                                Открыть бота {code.botUsername ? `@${code.botUsername}` : ''} с кодом
                            </a>
                        ) : null}
                        <p className="text-muted-foreground">
                            Или отправьте боту сообщение: <code>/start {code.code}</code>. Потом
                            обновите список ниже.
                        </p>
                    </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                    <div>
                        <AButton
                            title={code ? 'Новый код' : 'Привязать Telegram'}
                            size="small"
                            isActive={!action.busy}
                            clickHendler={() => void issue()}
                        />
                    </div>
                    <div>
                        <AButton
                            title="Обновить список"
                            size="small"
                            color="grey"
                            clickHendler={() => bindings.reload()}
                        />
                    </div>
                </div>
                {action.error && <p className="text-sm text-destructive">{action.error}</p>}
                {bindings.error && <p className="text-sm text-destructive">{bindings.error}</p>}
                {bindings.data && bindings.data.length === 0 && (
                    <p className="text-sm text-muted-foreground">Привязанных чатов пока нет.</p>
                )}
                {bindings.data?.map((binding) => (
                    <div key={binding.id} className="flex items-center justify-between gap-3 text-sm">
                        <span>
                            {binding.displayName ?? 'Чат'}
                            {binding.telegramUsername ? ` (@${binding.telegramUsername})` : ''}
                        </span>
                        <div className="w-28 shrink-0">
                            <AButton
                                title="Отвязать"
                                size="xsmall"
                                color="grey"
                                isActive={!action.busy}
                                clickHendler={() => void revoke(binding.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
};
