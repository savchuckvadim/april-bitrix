'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePriceDto, ProfPricesForm, useProfPrice, useUpdateProfPrice } from '@/modules/entities/garant/prof-price';
import { useComplects } from '@/modules/entities/garant/complect';
import { useSupplies } from '@/modules/entities/garant/supplies';
import { usePackages } from '@/modules/entities/garant/package';
import { Button } from '@workspace/ui/components/button';
const path = '/garant/prof-prices';

export default function EditProfPricePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: profPrice, isLoading } = useProfPrice(id);
    const updateProfPrice = useUpdateProfPrice();

    // Загружаем связанные сущности для получения кодов
    const { data: complects } = useComplects();
    const { data: supplies } = useSupplies();
    const { data: packages } = usePackages();

    const handleSubmit = (data: CreatePriceDto) => {
        updateProfPrice.mutate(
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

    if (!profPrice) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Prof Price не найден</h1>
                    <Button onClick={() => router.push(path)}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    // Преобразуем PriceEntity в CreatePriceDto для формы
    // Получаем коды из связанных сущностей по ID
    const getComplectCode = (): CreatePriceDto['complectCode'] | undefined => {
        if (!profPrice.complect_id || !complects) return undefined;
        const complect = complects.find((c) => c.id === profPrice.complect_id);
        return complect?.code as CreatePriceDto['complectCode'] | undefined;
    };

    const getPackageCode = (): string | undefined => {
        if (!profPrice.garant_package_id || !packages) return undefined;
        const pkg = packages.find((p) => p.id === profPrice.garant_package_id);
        return pkg?.code;
    };

    const getSupplyCode = (): string | undefined => {
        if (!profPrice.supply_id || !supplies) return undefined;
        const supply = supplies.find((s) => s.id === profPrice.supply_id);
        return supply?.code;
    };

    const initialData: CreatePriceDto = {
        code: profPrice.code,
        region_type: profPrice.region_type,
        value: profPrice.value,
        isSpecial: profPrice.isSpecial,
        discount: profPrice.discount ?? undefined,
        complectCode: getComplectCode(),
        garantPackageCode: getPackageCode(),
        supplyCode: getSupplyCode(),
        supplyTypeCode: profPrice.supply_type_code,
        supplyType: profPrice.supply_type,
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <ProfPricesForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateProfPrice.isPending}
            />
        </div>
    );
}
