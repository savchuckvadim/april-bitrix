'use client';

import { BxRqResponseDto } from '@workspace/nest-api';
import { BxRqCard } from '@/modules/entities/portal-bitrix/bx-rqs/ui/bxRqs-card';
import { createRqFieldsContext, RqFieldsManager } from '@/modules/features/pbx/rq-fields';
import { EntityRelationsTabs } from '@/modules/shared/ui';

interface RqDetailsWidgetProps {
    portalId: number;
    rq: BxRqResponseDto;
    onEdit?: () => void;
    onBack?: () => void;
}

export function RqDetailsWidget({
    portalId,
    rq,
    onEdit,
    onBack,
}: RqDetailsWidgetProps) {
    const fieldsContext = createRqFieldsContext(portalId, rq.id);

    return (
        <div className="space-y-4 container mx-auto">
            <EntityRelationsTabs
                defaultTab="main"
                tabs={[
                    {
                        id: 'main',
                        label: 'Main info',
                        content: (
                            <BxRqCard
                                item={rq}
                                onEdit={onEdit}
                                onViewDetails={onBack}
                            />
                        ),
                    },
                    {
                        id: 'fields',
                        label: 'Fields',
                        content: <RqFieldsManager context={fieldsContext} />,
                    },
                ]}
            />
        </div>
    );
}
