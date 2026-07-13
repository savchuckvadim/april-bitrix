'use client';

import { PbxProcessManager } from '../../../../process';
import { rpaProcessAdapter } from '../../lib/api/rpa-process-adapter';

export function RpaProcessPanel({ portalId }: { portalId: number }) {
    return <PbxProcessManager portalId={portalId} adapter={rpaProcessAdapter} />;
}
