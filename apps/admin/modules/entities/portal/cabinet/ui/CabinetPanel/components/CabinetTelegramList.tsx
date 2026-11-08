'use client';

import { AButton } from '@workspace/april-ui';
import { CABINET_TEXT as TEXT } from '../../../consts/cabinet.const';
import { useCabinetTelegramTest } from '@/modules/entities/cabinet-guide';
import { useRevokeCabinetTelegram } from '../../../lib/hooks/use-cabinet';
import type { CabinetTelegramBinding } from '../../../model';

interface CabinetTelegramListProps {
    portalId: number;
    bindings: CabinetTelegramBinding[];
}

/** Привязанные Telegram-чаты сотрудников портала. */
export const CabinetTelegramList = ({
    portalId,
    bindings,
}: CabinetTelegramListProps) => {
    const revoke = useRevokeCabinetTelegram(portalId);
    const test = useCabinetTelegramTest(portalId);

    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">{TEXT.telegramTitle}</h4>
            {bindings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {TEXT.telegramEmpty}
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {bindings.map(binding => (
                        <li
                            key={binding.id}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <span>
                                {binding.displayName ?? 'Без имени'}
                                {binding.telegramUsername
                                    ? ` (@${binding.telegramUsername})`
                                    : ''}
                                <span className="text-muted-foreground">
                                    {binding.bitrixUserId
                                        ? ` · Б24 #${binding.bitrixUserId}`
                                        : ''}
                                    {binding.userId
                                        ? ` · учётка #${binding.userId}`
                                        : ''}
                                </span>
                            </span>
                            <div className="flex shrink-0 gap-2">
                                <div className="w-28">
                                    <AButton
                                        title={test.isPending ? 'Проверяю…' : 'Проверить'}
                                        size="xsmall"
                                        isActive={!test.isPending}
                                        clickHendler={() => test.mutate(binding.id)}
                                    />
                                </div>
                                <div className="w-28">
                                    <AButton
                                        title={TEXT.telegramRevoke}
                                        size="xsmall"
                                        color="grey"
                                        isActive={!revoke.isPending}
                                        clickHendler={() => revoke.mutate(binding.id)}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
