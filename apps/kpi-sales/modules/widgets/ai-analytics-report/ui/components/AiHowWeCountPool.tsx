'use client';

import type { AiAboutPool } from '@/modules/entities/ai-analytics';
import { buildAiAboutPool } from '../../lib/ai-about-pool.util';
import { AiHowWeCountSection } from './AiHowWeCountSection';

interface AiHowWeCountPoolProps {
    pool: AiAboutPool;
}

/** «Общая статистика порталов»: участие портала, число порталов, разброс. */
export const AiHowWeCountPool = ({ pool }: AiHowWeCountPoolProps) => (
    <AiHowWeCountSection view={buildAiAboutPool(pool)} topic="pool" />
);
