'use client';

import { useRouter } from 'next/navigation';
import { useCreatePackage, IGarantPackageCreate, PackageForm, PACKAGE_LIST_PATH } from '@/modules/entities/garant/package';
import { Button } from '@workspace/ui';

const path = PACKAGE_LIST_PATH;

export default function NewPackagePage() {
    const router = useRouter();
    const createPackage = useCreatePackage();

    const handleSubmit = (data: IGarantPackageCreate) => {
        createPackage.mutate(data, {
            onSuccess: () => {
                router.push(path);
            },
            onError: (error: Error) => {
                // Ошибка будет обработана через createPackage.error
                console.error('Error creating package:', error);
            },
        });
    };

    const handleCancel = () => {
        router.push(path);
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-2xl font-bold">New Package</h1>
            <div className="mb-4 flex flex-row justify-between">
                <Button variant="outline" onClick={router.back}>
                    Назад
                </Button>
            </div>
            <PackageForm
                mode="create"
                onSubmit={(data: IGarantPackageCreate) => handleSubmit(data)}
                onCancel={handleCancel}
                isLoading={createPackage.isPending}
                serverError={createPackage.error}
            />
        </div>
    );
}
