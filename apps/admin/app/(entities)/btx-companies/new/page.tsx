'use client';

import { useRouter } from 'next/navigation';
import { BtxCompanieForm } from '@/modules/entities/btx-companies/ui/btxCompanies-form';
import { useCreateBtxCompanie } from '@/modules/entities/btx-companies/lib/hooks';
import { CreateBtxCompanyDto, UpdateBtxCompanyDto } from '@workspace/nest-api';

export default function NewBtxCompaniePage() {
    const router = useRouter();
    const createBtxCompanie = useCreateBtxCompanie();

    const handleSubmit = (data: CreateBtxCompanyDto) => {
        createBtxCompanie.mutate(data, {
            onSuccess: () => {
                router.push('/btx-companies');
            },
        });
    };

    const handleCancel = () => {
        router.push('/btx-companies');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxCompanieForm
                mode="create"
                onSubmit={(data: CreateBtxCompanyDto | UpdateBtxCompanyDto) => handleSubmit(data as CreateBtxCompanyDto)}
                onCancel={handleCancel}
                isLoading={createBtxCompanie.isPending}
            />
        </div>
    );
}
