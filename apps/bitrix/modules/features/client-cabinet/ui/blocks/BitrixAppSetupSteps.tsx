'use client';

import { useState } from 'react';
import { AButton } from '@workspace/april-ui';
import type { CabinetBitrixAppSetup } from '@workspace/bitrix';

/** Скопировать в буфер; во фрейме Битрикса буфер может быть закрыт — тогда false. */
async function copyText(value: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false;
    }
}

/** Адрес для поля Битрикс24: только чтение, выделяется кликом, кнопка «Скопировать». */
const CopyField = ({ label, value }: { label: string; value: string }) => {
    const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
    const copy = async () => setState((await copyText(value)) ? 'copied' : 'manual');
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm">{label}</span>
            <div className="flex flex-wrap items-center gap-2">
                <input
                    readOnly
                    value={value}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs"
                />
                <div>
                    <AButton title="Скопировать" size="small" color="grey" clickHendler={() => void copy()} />
                </div>
            </div>
            {state === 'copied' && <span className="text-xs text-muted-foreground">Скопировано</span>}
            {state === 'manual' && (
                <span className="text-xs text-muted-foreground">
                    Выделите адрес в поле и скопируйте сочетанием Ctrl+C
                </span>
            )}
        </div>
    );
};

/**
 * Как создать локальное приложение April в Битрикс24 — по шагам, с
 * адресами для копирования. Делает администратор портала один раз.
 */
export const BitrixAppSetupSteps = ({ setup }: { setup: CabinetBitrixAppSetup }) => (
    <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm">
        <li>
            Откройте раздел для разработчиков портала → «Другое» → «Локальное приложение».
            <div className="mt-1 w-56">
                <AButton
                    title="Открыть раздел в Битрикс24"
                    size="small"
                    clickHendler={() => window.open(setup.devSectionUrl, '_blank', 'noopener')}
                />
            </div>
        </li>
        <li>
            Тип приложения — «Серверное». Галочку «Использует только API» снимите: приложению
            нужен пункт в левом меню.
        </li>
        <li>
            <CopyField label="«Путь вашего обработчика»:" value={setup.handlerUrl} />
        </li>
        <li>
            <CopyField label="«Путь для первоначальной установки»:" value={setup.installUrl} />
        </li>
        <li>
            Права доступа — отметьте: <span className="font-mono text-xs">{setup.scopes.join(', ')}</span>.
            Если какого-то права в списке нет — пропустите.
        </li>
        <li>
            Сохраните приложение. Битрикс24 покажет «Код приложения» и «Ключ приложения» — внесите
            их в форму ниже.
        </li>
        <li>
            После этого в карточке приложения в Битрикс24 нажмите «Установить» (или откройте April
            в левом меню).
        </li>
    </ol>
);
