'use client';

import { useRouter } from 'next/navigation';
import { useCreateComplect, CreateComplectDto, ComplectForm } from '@/modules/entities/garant/complect';


const path = '/garant/complect';
export default function NewComplectPage() {
    const router = useRouter();
    const createComplect = useCreateComplect();

    const handleSubmit = (data: CreateComplectDto) => {
        createComplect.mutate(data, {
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
            <ComplectForm
                mode="create"
                onSubmit={(data: CreateComplectDto) => handleSubmit(data)}
                onCancel={handleCancel}
                isLoading={createComplect.isPending}
            />
        </div>
    );
}
