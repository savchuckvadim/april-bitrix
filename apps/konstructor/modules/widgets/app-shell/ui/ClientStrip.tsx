'use client';

import { InnChip, ProspectScaleBar } from '@workspace/april-ui/entity';
import { ChipSelect } from '@workspace/april-ui/fields';
import type { useClientHeader } from '../hooks/use-client-header';

type ClientHeader = ReturnType<typeof useClientHeader>;

export interface ClientStripProps {
    prospect: ClientHeader['prospect'];
    status: ClientHeader['status'];
    inn: ClientHeader['inn'];
}

/**
 * Полоска клиента как в «Звонках»: прогноз, статус, ИНН. Поля нет на портале
 * — его блок не рисуется.
 */
export const ClientStrip = ({ prospect, status, inn }: ClientStripProps) => (
    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
        {prospect ? <ProspectScaleBar {...prospect} /> : null}
        {status ? (
            <ChipSelect
                value={status.value}
                options={status.options}
                disabled={status.isLoading}
                onChange={status.select}
                ariaLabel="Статус клиента"
            />
        ) : null}
        {inn !== undefined ? <InnChip value={inn} /> : null}
    </div>
);
