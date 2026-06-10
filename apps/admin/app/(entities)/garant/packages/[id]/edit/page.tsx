'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePackage, useUpdatePackage, IGarantPackageCreate, PackageForm, PACKAGE_LIST_PATH } from '@/modules/entities/garant/package';
import { Button } from '@workspace/ui/index';

const path = PACKAGE_LIST_PATH;

export default function EditPackagePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: pkg, isLoading } = usePackage(id);
    const updatePackage = useUpdatePackage();

    const handleSubmit = (data: IGarantPackageCreate) => {
        updatePackage.mutate(
            { id, dto: data },
            {
                onSuccess: () => {
                    router.push(`${path}/${id}`);
                },
                onError: (error: Error) => {
                    // Ошибка будет обработана через updatePackage.error
                    console.error('Error updating package:', error);
                },
            }
        );
    };

    const handleCancel = () => {
        router.push(`${path}/${id}`);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Package не найден</h1>
                    <Button onClick={() => router.push(path)}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    // Преобразуем PackageEntityDto в IGarantPackageCreate для формы
    const initialData: IGarantPackageCreate = {
        name: pkg.name,
        fullName: pkg.fullName,
        shortName: pkg.shortName,
        description: pkg.description || undefined,
        code: pkg.code,
        type: pkg.type,
        color: pkg.color || undefined,
        weight: pkg.weight || undefined,
        abs: pkg.abs || undefined,
        number: pkg.number,
        productType: pkg.productType || undefined,
        withABS: pkg.withABS,
        isChanging: pkg.isChanging,
        withDefault: pkg.withDefault,
        infoblock_id: pkg.infoblock_id || undefined,
        info_group_id: pkg.info_group_id || undefined,
    };

    return (
        <div className="container mx-auto space-y-6">
            <PackageForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updatePackage.isPending}
                serverError={updatePackage.error}
            />
        </div>
    );
}
