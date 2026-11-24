'use client';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { PROVIDER_IMAGE_LEGACY_TEXT } from '@/modules/entities/portal-provider/provider-image';
import { PROVIDER_IMAGES_PANEL_TEXT } from '../consts/provider-images-panel.text';
import { useProviderImagesPanel } from '../hooks/use-provider-images-panel';
import { LegacyImportDialog } from '../legacy-import';
import { ProviderImagesRqCard } from './ProviderImagesRqCard';

interface ProviderImagesPanelProps {
    portalId: number;
}

const TEXT = PROVIDER_IMAGES_PANEL_TEXT;

/**
 * Страница «Печати, подписи и логотипы» портала: все реквизиты всех его
 * поставщиков, у каждых готовая секция картинок, и временная кнопка переноса
 * картинок из легаси.
 */
export function ProviderImagesPanel({ portalId }: ProviderImagesPanelProps) {
    const panel = useProviderImagesPanel(portalId);

    return (
        <div className="space-y-4 pb-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">{TEXT.title}</h1>
                    <p className="text-sm text-muted-foreground">{TEXT.portal(panel.domain)}</p>
                    <p className="text-sm text-muted-foreground">{TEXT.description}</p>
                </div>
                <Button variant="outline" onClick={() => panel.setImportOpen(true)}>
                    {PROVIDER_IMAGE_LEGACY_TEXT.open}
                </Button>
            </div>

            {panel.status === 'loading' && (
                <p className="text-sm text-muted-foreground">{TEXT.loading}</p>
            )}

            {panel.status === 'error' && (
                <Alert variant="destructive">
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        <span>{panel.errorMessage}</span>
                        <Button size="sm" variant="outline" onClick={panel.retry}>
                            {TEXT.retry}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {panel.status === 'empty' && (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        {TEXT.empty}
                    </CardContent>
                </Card>
            )}

            {panel.status === 'ready' && (
                <div className="space-y-4">
                    {panel.targets.map((target) => (
                        <ProviderImagesRqCard key={target.rqId} target={target} />
                    ))}
                </div>
            )}

            <LegacyImportDialog open={panel.importOpen} onOpenChange={panel.setImportOpen} />
        </div>
    );
}
