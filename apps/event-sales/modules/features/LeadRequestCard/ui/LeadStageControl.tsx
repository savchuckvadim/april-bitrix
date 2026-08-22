'use client';

import { FC } from 'react';
import { MicroSelect } from '@workspace/april-ui';
import { LeadStageBar } from '@/modules/entities/RelatedCrm';
import { useLeadBitrixStage } from '../lib/hooks/use-lead-bitrix-stage';

interface LeadStageControlProps {
    /** Название лида — в подпись полоски: «Лид <название> · стадия · N/M». */
    title: string;
}

/**
 * Битриксовская стадия лида в панели заявки: та же градиент-полоска лестницы
 * стадий, что в шапке и карточках, с подписью и селектом смены стадии.
 * Лид на финале (CONVERTED/JUNK) или вне лестницы полоску не получает —
 * остаётся селект с плейсхолдером.
 */
export const LeadStageControl: FC<LeadStageControlProps> = ({ title }) => {
    const { statusId, options, isOnLadder, saving, changeStage } =
        useLeadBitrixStage();

    // Слепка портала нет — менять стадию не по чему, контрол молчит.
    if (!options.length) return null;

    return (
        <div className="flex min-w-0 items-end gap-2">
            <LeadStageBar
                statusId={statusId}
                title={`Лид ${title}`}
                withLabel
                className="min-w-0 flex-1"
            />
            <MicroSelect
                value={isOnLadder && statusId ? statusId : undefined}
                options={options}
                onChange={changeStage}
                placeholder="Стадия"
                ariaLabel="Сменить стадию лида"
                disabled={saving}
                className="shrink-0"
            />
        </div>
    );
};
