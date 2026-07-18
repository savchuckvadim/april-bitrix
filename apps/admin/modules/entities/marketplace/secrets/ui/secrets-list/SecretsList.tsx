'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppSecretDto } from '@workspace/nest-admin-api';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared';
import { Plus } from 'lucide-react';
import { useDeleteSecret, useSecrets } from '../../lib/hooks/use-secrets';
import { SecretsTable } from '../secrets-table';

/** Список OAuth-кред приложений с добавлением, изменением и удалением. */
export function SecretsList() {
    const router = useRouter();
    const { data, isLoading } = useSecrets();
    const deleteSecret = useDeleteSecret();

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [secretToDelete, setSecretToDelete] = React.useState<string | null>(null);

    const handleEdit = (secret: AppSecretDto) => {
        router.push(`/marketplace/secrets/${secret.code}/edit`);
    };

    const handleDelete = (secret: AppSecretDto) => {
        setSecretToDelete(secret.code);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (secretToDelete) {
            deleteSecret.mutate(secretToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSecretToDelete(null);
                },
            });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Креды приложений</h1>
                <Button onClick={() => router.push('/marketplace/secrets/new')}>
                    <Plus className="w-4 h-4" />
                    Добавить
                </Button>
            </div>

            <SecretsTable
                data={Array.isArray(data) ? data : []}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Удалить креды приложения?"
                description={`Запись «${secretToDelete ?? ''}» будет удалена. Рефреш токенов перейдёт на env-фолбэк (или начнёт падать с понятной ошибкой).`}
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
                isLoading={deleteSecret.isPending}
            />
        </>
    );
}
