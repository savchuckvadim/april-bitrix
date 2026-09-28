'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { LEGACY_CREDENTIALS_TEXT } from '../../consts/legacy-credentials.const';
import { useLegacyCredentialsForm } from '../../lib/hooks/use-legacy-credentials-form';
import { CurrentCredentials } from './components/CurrentCredentials';
import { HookKeyForm } from './components/HookKeyForm';

export interface LegacyCredentialsCardProps {
    portalId: number;
}

/**
 * Карточка «Вебхук Битрикса в online»: показывает, с каким ключом бэки
 * ходят в Битрикс портала, и записывает новый через Laravel (он шифрует).
 */
export const LegacyCredentialsCard = ({
    portalId,
}: LegacyCredentialsCardProps) => {
    const form = useLegacyCredentialsForm(portalId);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{LEGACY_CREDENTIALS_TEXT.title}</CardTitle>
                <CardDescription>
                    {LEGACY_CREDENTIALS_TEXT.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {form.isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        {LEGACY_CREDENTIALS_TEXT.loading}
                    </p>
                ) : form.isError ? (
                    <p className="text-sm text-destructive">
                        {LEGACY_CREDENTIALS_TEXT.loadError}
                    </p>
                ) : !form.domain || !form.current ? (
                    <p className="text-sm text-muted-foreground">
                        {LEGACY_CREDENTIALS_TEXT.noDomain}
                    </p>
                ) : (
                    <>
                        <CurrentCredentials
                            current={form.current}
                            reveal={form.reveal}
                            keysDiffer={form.keysDiffer}
                            onToggleReveal={form.toggleReveal}
                        />
                        <HookKeyForm form={form} />
                    </>
                )}
            </CardContent>
        </Card>
    );
};
