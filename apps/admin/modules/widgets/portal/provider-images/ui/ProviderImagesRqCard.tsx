'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { ProviderImagesSection } from '@/modules/entities/portal-provider/provider-image';
import type { ProviderImageTarget } from '../lib/provider-image-targets.util';

interface ProviderImagesRqCardProps {
    target: ProviderImageTarget;
}

/** Карточка реквизитов поставщика: название и готовая секция картинок (загрузка, замена, удаление). */
export function ProviderImagesRqCard({ target }: ProviderImagesRqCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{target.title}</CardTitle>
                {target.subtitle && <CardDescription>{target.subtitle}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ProviderImagesSection rqId={target.rqId} />
            </CardContent>
        </Card>
    );
}
