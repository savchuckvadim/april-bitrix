'use client';

import { useRouter } from 'next/navigation';
import { useCreateSupply, CreateSupplyDto, SuppliesForm } from '@/modules/entities/garant/supplies';


const path = '/garant/supplies';
export default function NewSupplyPage() {
    const router = useRouter();
    const createSupply = useCreateSupply();

    const handleSubmit = (data: CreateSupplyDto) => {
        createSupply.mutate(data, {
            onSuccess: () => {
                router.push(path);
            },
        });
    };

    const handleCancel = () => {
        router.push(path);
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <SuppliesForm
                mode="create"
                onSubmit={(data: CreateSupplyDto) => handleSubmit(data)}
                onCancel={handleCancel}
                isLoading={createSupply.isPending}
            />
        </div>
    );
}
