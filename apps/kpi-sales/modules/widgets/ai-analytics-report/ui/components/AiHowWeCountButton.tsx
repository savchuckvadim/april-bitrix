'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import type { AiAboutEndpoint } from '@/modules/entities/ai-analytics';
import { AI_ABOUT_ENDPOINT_LABELS } from '../../lib/ai-about.util';
import { AiHowWeCountDialog } from '../AiHowWeCountDialog';

export const AI_HOW_WE_COUNT_LABEL = 'Как считаем';

interface AiHowWeCountButtonProps {
    /** Раздел витрины: overview | plan/daily | brief | manager/style. */
    endpoint: AiAboutEndpoint;
    /** Подпись действия (aria-label и заголовок подсказки). */
    label?: string;
    className?: string;
}

/**
 * Иконка «Как считаем» с подсказкой: открывает диалог блока about для
 * раздела; запрос (fetchAiAbout) уходит при открытии, состояния загрузки и
 * ошибки — внутри диалога. Самодостаточна — ставится рядом с действиями
 * любой секции.
 */
export const AiHowWeCountButton = ({
    endpoint,
    label = AI_HOW_WE_COUNT_LABEL,
    className,
}: AiHowWeCountButtonProps) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconAction
                icon={CircleHelp}
                label={label}
                hint={`${AI_ABOUT_ENDPOINT_LABELS[endpoint]}: что считает раздел, откуда данные и какие параметры действуют`}
                onClick={() => setOpen(true)}
                className={className}
            />
            <AiHowWeCountDialog
                endpoint={endpoint}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
};
