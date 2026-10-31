'use client';

import { Link2Off } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';

/** Ссылку отозвали или вышел её срок. */
export const PublicGoneScreen = () => (
    <EmptyState
        icon={Link2Off}
        layout="screen"
        title="Ссылка больше не действует"
        description="Её отозвали или вышел срок. Попросите новую у того, кто её выдал."
    />
);
