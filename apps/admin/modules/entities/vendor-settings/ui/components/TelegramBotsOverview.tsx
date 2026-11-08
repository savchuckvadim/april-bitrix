'use client';

import { ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import {
    useTestTelegramBot,
    useVendorTelegramBots,
} from '../../lib/hooks/use-vendor-settings';
import {
    TELEGRAM_BOT_STATUS_TONE,
    TELEGRAM_BOTS_TEXT,
    type VendorTelegramBot,
} from '../../model';

/** Подпись бота: @имя, «не задан» или причина, почему Telegram его не узнал. */
function botName(bot: VendorTelegramBot): string {
    if (bot.status === 'not-set') return TELEGRAM_BOTS_TEXT.notSet;
    if (bot.status === 'error') return bot.error ?? TELEGRAM_BOTS_TEXT.loadError;
    return bot.username ? `@${bot.username}` : TELEGRAM_BOTS_TEXT.unknownName;
}

/** Доходят ли до нас сообщения боту — по ответу Telegram. */
function WebhookLine({ bot }: { bot: VendorTelegramBot }) {
    const webhook = bot.webhook;
    if (!webhook) return null;
    return (
        <>
            <p className={webhook.url ? 'text-xs text-muted-foreground' : 'text-xs text-destructive'}>
                {webhook.url
                    ? TELEGRAM_BOTS_TEXT.webhookOk(webhook.url, webhook.pending)
                    : TELEGRAM_BOTS_TEXT.webhookMissing}
            </p>
            {webhook.lastError && (
                <p className="text-xs text-destructive">
                    {TELEGRAM_BOTS_TEXT.webhookError(webhook.lastError)}
                </p>
            )}
        </>
    );
}

/** Тест: общий чат бота (поддержка, тревоги); клиентский — у привязки портала. */
function TestControl({ bot }: { bot: VendorTelegramBot }) {
    const test = useTestTelegramBot();
    if (bot.status !== 'ok') return null;
    if (!bot.canTest) {
        return <p className="text-xs text-muted-foreground">{TELEGRAM_BOTS_TEXT.clientTestHint}</p>;
    }
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                disabled={test.isPending}
                onClick={() => test.mutate(bot.key)}
            >
                {test.isPending ? TELEGRAM_BOTS_TEXT.testing : TELEGRAM_BOTS_TEXT.test}
            </Button>
            {test.data && (
                <span className={test.data.ok ? 'text-xs' : 'text-xs text-destructive'}>
                    {test.data.message}
                </span>
            )}
        </div>
    );
}

function TelegramBotRow({ bot }: { bot: VendorTelegramBot }) {
    return (
        <li className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{bot.title}</span>
                <ToneBadge tone={TELEGRAM_BOT_STATUS_TONE[bot.status]} variant="soft">
                    {botName(bot)}
                </ToneBadge>
            </div>
            <p className="text-xs text-muted-foreground">
                {bot.place === 'env'
                    ? TELEGRAM_BOTS_TEXT.placeEnv
                    : TELEGRAM_BOTS_TEXT.placeAdmin}
            </p>
            <WebhookLine bot={bot} />
            {bot.sameTokenAs.length > 0 && (
                <p className="text-xs text-destructive">
                    {TELEGRAM_BOTS_TEXT.sameToken(bot.sameTokenAs)}
                </p>
            )}
            <TestControl bot={bot} />
        </li>
    );
}

/**
 * «Кто есть кто» среди Telegram-ботов April над полями группы: какой бот
 * на самом деле стоит в каждом токене (имя спрашивает бэк у Telegram) и не
 * вставлен ли один токен в два места. Бот тревог виден тоже, хотя его токен
 * живёт только в окружении сервера.
 */
export function TelegramBotsOverview() {
    const { data, isLoading, error } = useVendorTelegramBots();

    return (
        <div className="space-y-3 rounded-lg border border-dashed p-4 text-sm">
            <p className="font-medium">{TELEGRAM_BOTS_TEXT.title}</p>
            {isLoading && (
                <p className="text-muted-foreground">{TELEGRAM_BOTS_TEXT.loading}</p>
            )}
            {error && (
                <p className="text-destructive">
                    {TELEGRAM_BOTS_TEXT.loadError}: {getApiErrorMessage(error)}
                </p>
            )}
            {data && (
                <ul className="space-y-3">
                    {data.map((bot) => (
                        <TelegramBotRow key={bot.key} bot={bot} />
                    ))}
                </ul>
            )}
        </div>
    );
}
