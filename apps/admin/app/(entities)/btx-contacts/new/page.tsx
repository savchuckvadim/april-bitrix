'use client';

import { useRouter } from 'next/navigation';
import { BtxContactForm } from '@/modules/entities/btx-contacts/ui/btxContacts-form';
import { useCreateBtxContact } from '@/modules/entities/btx-contacts/lib/hooks';
import { CreateBtxContactDto, UpdateBtxContactDto } from '@workspace/nest-api';

export default function NewBtxContactPage() {
    const router = useRouter();
    const createBtxContact = useCreateBtxContact();

    const handleSubmit = (data: CreateBtxContactDto) => {
        createBtxContact.mutate(data, {
            onSuccess: () => {
                router.push('/btx-contacts');
            },
        });
    };

    const handleCancel = () => {
        router.push('/btx-contacts');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxContactForm
                mode="create"
                onSubmit={(data: CreateBtxContactDto | UpdateBtxContactDto) => handleSubmit(data as CreateBtxContactDto)}
                onCancel={handleCancel}
                isLoading={createBtxContact.isPending}
            />
        </div>
    );
}
