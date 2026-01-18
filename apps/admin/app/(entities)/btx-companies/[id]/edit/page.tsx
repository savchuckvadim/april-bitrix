'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxCompanie, useUpdateBtxCompanie } from '@/modules/entities/btx-companies/lib/hooks';
import { BtxCompanieForm } from '@/modules/entities/btx-companies/ui/btxCompanies-form';
import { UpdateBtxCompanyDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBtxCompaniePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxCompaniesId = parseInt(id, 10);
    const { data: btxCompanies, isLoading } = useBtxCompanie(btxCompaniesId);
    const updateBtxCompanie = useUpdateBtxCompanie();

    const handleSubmit = (data: UpdateBtxCompanyDto) => {
        updateBtxCompanie.mutate(
            { id: btxCompaniesId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/btx-companies/${btxCompaniesId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/btx-companies/${btxCompaniesId}`);
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

    if (!btxCompanies) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxCompanie не найден</h1>
                    <Button onClick={() => router.push('/btx-companies')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxCompanieForm
                mode="edit"
                initialData={btxCompanies as UpdateBtxCompanyDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBtxCompanie.isPending}
            />
        </div>
    );
}
