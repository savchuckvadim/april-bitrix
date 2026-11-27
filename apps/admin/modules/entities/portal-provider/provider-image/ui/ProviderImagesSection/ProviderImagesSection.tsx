'use client';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { PROVIDER_IMAGES_TEXT } from '../../model';
import { ProviderImageSlotCard } from '../ProviderImageSlotCard';
import { useProviderImagesSection } from './hooks/use-provider-images-section';

interface ProviderImagesSectionProps {
    /** id реквизитов поставщика (`RqEntity.id`) */
    rqId: number;
}

/** Раздел «Печать, подписи, логотип и QR» карточки поставщика: по слоту на роль. */
export function ProviderImagesSection({ rqId }: ProviderImagesSectionProps) {
    const section = useProviderImagesSection(rqId);

    return (
        <section className="space-y-3">
            <div className="space-y-0.5">
                <h3 className="text-sm font-semibold">{PROVIDER_IMAGES_TEXT.title}</h3>
                <p className="text-xs text-muted-foreground">{PROVIDER_IMAGES_TEXT.description}</p>
            </div>

            {section.status === 'loading' && (
                <p className="text-sm text-muted-foreground">{PROVIDER_IMAGES_TEXT.loading}</p>
            )}

            {section.status === 'unavailable' && (
                <Alert>
                    <AlertDescription>{PROVIDER_IMAGES_TEXT.unavailable}</AlertDescription>
                </Alert>
            )}

            {section.status === 'error' && (
                <Alert variant="destructive">
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        <span>{section.errorMessage}</span>
                        <Button size="sm" variant="outline" onClick={section.retry}>
                            {PROVIDER_IMAGES_TEXT.retry}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {section.status === 'ready' && (
                <>
                    {section.isEmpty && (
                        <p className="text-sm text-muted-foreground">{PROVIDER_IMAGES_TEXT.allEmpty}</p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {section.slots.map((slot) => (
                            <ProviderImageSlotCard key={slot.role} rqId={rqId} slot={slot} />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{PROVIDER_IMAGES_TEXT.notes}</p>
                </>
            )}
        </section>
    );
}
