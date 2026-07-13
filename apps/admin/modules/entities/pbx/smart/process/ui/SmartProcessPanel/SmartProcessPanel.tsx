'use client';

import { PbxProcessManager } from '../../../../process';
import { smartProcessAdapter } from '../../lib/api/smart-process-adapter';

export function SmartProcessPanel({ portalId }: { portalId: number }) {
    return <PbxProcessManager portalId={portalId} adapter={smartProcessAdapter} />;
}
