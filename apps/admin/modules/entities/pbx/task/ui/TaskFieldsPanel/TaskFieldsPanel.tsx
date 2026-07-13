'use client';

import { PbxFieldsManager } from '../../../fields';
import { taskFieldsAdapter } from '../../lib/api/task-fields-api';

export function TaskFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={taskFieldsAdapter} />;
}
