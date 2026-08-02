'use client';

import { useCallback, useMemo, useState } from 'react';
import { SALES_PROCESS } from '../../_core/constants/sales-process';
import { buildVerdict } from '../../_core/copy/verdict';
import { useProcessConfig } from '../../_core/hooks/use-process-config';
import type { ProcessSatellite, StageView } from '../../_core/types';

/**
 * Вся логика страницы «Процесс продажи»: конфигурация, вердикт и то, какая
 * модалка сейчас открыта. Компонент только раскладывает готовое по вёрстке.
 */
export const useSalesProcess = () => {
    const process = useProcessConfig(SALES_PROCESS);

    const [openedStage, setOpenedStage] = useState<StageView | null>(null);
    const [openedSatellite, setOpenedSatellite] =
        useState<ProcessSatellite | null>(null);

    const verdict = useMemo(
        () => buildVerdict(SALES_PROCESS, process.model),
        [process.model],
    );

    const closeStage = useCallback(() => setOpenedStage(null), []);
    const closeSatellite = useCallback(() => setOpenedSatellite(null), []);

    return {
        ...process,
        definition: SALES_PROCESS,
        verdict,
        openedStage,
        openedSatellite,
        openStage: setOpenedStage,
        openSatellite: setOpenedSatellite,
        closeStage,
        closeSatellite,
    };
};
