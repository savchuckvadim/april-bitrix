'use client';

import { useRouter } from 'next/navigation';
import { useCreateProfPrice, CreatePriceDto, ProfPricesForm } from '@/modules/entities/garant/prof-price';


const path = '/garant/prof-prices';
export default function NewProfPricePage() {
    const router = useRouter();
    const createProfPrice = useCreateProfPrice();

    const handleSubmit = (data: CreatePriceDto) => {
        createProfPrice.mutate(data, {
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
            <ProfPricesForm
                mode="create"
                onSubmit={(data: CreatePriceDto) => handleSubmit(data)}
                onCancel={handleCancel}
                isLoading={createProfPrice.isPending}
            />
        </div>
    );
}
