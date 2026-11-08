'use client';

import { useState } from 'react';
import { ABadge, AButton, SectionCard } from '@workspace/april-ui';
import {
    checkBitrixAppKeys,
    getBitrixAppConnection,
    type CabinetBitrixAppCheck,
    type CabinetBitrixAppConnection,
} from '@workspace/bitrix';
import { useCabinetAction, useCabinetLoad } from '../../lib/cabinet-hooks';
import { formatDateTime } from '../../lib/cabinet-texts';
import { BitrixAppKeysForm } from './BitrixAppKeysForm';
import { BitrixAppSetupSteps } from './BitrixAppSetupSteps';

const Step = ({ done, title, hint }: { done: boolean; title: string; hint: string }) => (
    <div className="flex items-start gap-2 text-sm">
        <ABadge title={done ? 'готово' : 'нет'} size="small" color={done ? 'april' : 'grey'} />
        <div>
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground">{hint}</p>
        </div>
    </div>
);

/** Связь с порталом по последнему обновлению токена — понятными словами. */
function linkHint(connection: CabinetBitrixAppConnection): { ok: boolean; hint: string } {
    const last = connection.lastRefresh;
    if (!connection.install.installed) {
        return { ok: false, hint: 'Появится после установки приложения.' };
    }
    if (!last?.at) {
        return { ok: connection.keys.set, hint: 'Проверьте подключение кнопкой ниже.' };
    }
    return last.ok
        ? { ok: true, hint: `Работает, последнее обновление ${formatDateTime(last.at)}.` }
        : {
              ok: false,
              hint: `Не удалось обновить доступ ${formatDateTime(last.at)} — проверьте ключи кнопкой ниже.`,
          };
}

/**
 * «Подключение Битрикс24» — владельцу кабинета: как создать локальное
 * приложение April на портале, ключи приложения и проверка, что всё
 * связалось. Без ключей April не может работать с порталом.
 */
export const BitrixAppBlock = ({ portalId }: { portalId: number }) => {
    const load = useCabinetLoad(() => getBitrixAppConnection(portalId), [portalId]);
    const action = useCabinetAction();
    const [saved, setSaved] = useState<CabinetBitrixAppConnection | null>(null);
    const [check, setCheck] = useState<CabinetBitrixAppCheck | null>(null);
    const connection = saved ?? load.data;

    const runCheck = async () => {
        setCheck(null);
        const result = await action.run(() => checkBitrixAppKeys(portalId));
        if (result) {
            setCheck(result);
            setSaved(null);
            load.reload();
        }
    };

    return (
        <SectionCard
            title="Подключение Битрикс24"
            description="April работает с вашим порталом через локальное приложение Битрикс24. Его один раз создаёт администратор портала и вносит сюда ключи."
        >
            {load.error && <p className="text-sm text-destructive">{load.error}</p>}
            {connection && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Step
                            done={connection.keys.set}
                            title="Ключи приложения"
                            hint={
                                connection.keys.set
                                    ? `Внесены${connection.keys.updatedAt ? ` ${formatDateTime(connection.keys.updatedAt)}` : ''}: ${connection.keys.clientId ?? ''}`
                                    : 'Не внесены — создайте приложение по шагам ниже и внесите ключи.'
                            }
                        />
                        <Step
                            done={connection.install.installed}
                            title="Приложение установлено на портале"
                            hint={
                                connection.install.installed
                                    ? connection.install.installedAt
                                        ? `Установлено ${formatDateTime(connection.install.installedAt)}.`
                                        : 'Установлено.'
                                    : 'Нажмите «Установить» в карточке приложения в Битрикс24.'
                            }
                        />
                        <Step done={linkHint(connection).ok} title="Связь с порталом" hint={linkHint(connection).hint} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-56">
                            <AButton
                                title={action.busy ? 'Проверяем…' : 'Проверить подключение'}
                                size="small"
                                isActive={!action.busy}
                                clickHendler={() => void runCheck()}
                            />
                        </div>
                        {check && (
                            <p className={check.result === 'ok' ? 'text-sm' : 'text-sm text-destructive'}>
                                {check.message}
                            </p>
                        )}
                        {action.error && <p className="text-sm text-destructive">{action.error}</p>}
                    </div>

                    <details open={!connection.keys.set} className="rounded-md border p-3">
                        <summary className="cursor-pointer text-sm font-medium">
                            Как создать приложение в Битрикс24
                        </summary>
                        <div className="mt-3">
                            <BitrixAppSetupSteps setup={connection.setup} />
                        </div>
                    </details>

                    <BitrixAppKeysForm
                        portalId={portalId}
                        replacing={connection.keys.set}
                        onSaved={(next) => {
                            setSaved(next);
                            setCheck(null);
                        }}
                    />
                </div>
            )}
        </SectionCard>
    );
};
