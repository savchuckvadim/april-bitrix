'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CreateSupplyDto, SuppliesForm, useSupply, useUpdateSupply } from '@/modules/entities/garant/supplies';
import { Button } from '@workspace/ui/components/button';
const path = '/garant/supplies';

export default function EditSupplyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: supply, isLoading } = useSupply(id);
    const updateSupply = useUpdateSupply();

    const handleSubmit = (data: CreateSupplyDto) => {
        updateSupply.mutate(
            { id: id, dto: data },
            {
                onSuccess: () => {
                    router.push(`${path}/${id}`);
                },
            },
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

    if (!supply) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Supply не найден</h1>
                    <Button onClick={() => router.push(path)}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    // Преобразуем GetSupplyResponseDto в CreateSupplyDto для формы
    const initialData: CreateSupplyDto = {
        name: supply.name,
        fullName: supply.fullName,
        shortName: supply.shortName,
        code: supply.code,
        type: supply.type,
        usersQuantity: supply.usersQuantity,
        coefficient: supply.coefficient,
        saleName_1: supply.saleName_1,
        saleName_2: supply.saleName_2,
        saleName_3: supply.saleName_3,
        description: supply.description,
        color: supply.color,
        contractName: supply.contractName,
        contractPropComment: supply.contractPropComment,
        contractPropEmail: supply.contractPropEmail,
        contractPropLoginsQuantity: supply.contractPropLoginsQuantity,
        lcontractName: supply.lcontractName,
        lcontractPropComment: supply.lcontractPropComment,
        lcontractPropEmail: supply.lcontractPropEmail,
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <SuppliesForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateSupply.isPending}
            />
        </div>
    );
}
