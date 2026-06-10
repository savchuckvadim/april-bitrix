'use client';

import { COMPLECT_PATH, ComplectForm, getToCreateComplect, useUpdateComplect } from "@/modules/entities/garant/complect";
import { CreateComplectDto, CreateComplectDtoProductType, CreateComplectDtoType, GetComplectResponseDto } from "@/modules/entities/garant/complect";
import { ComplectInfoblocksForm } from "@/modules/features/";
import { Button } from '@workspace/ui';
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const path = COMPLECT_PATH;

interface IComplectEditWidgetProps {
    complect: GetComplectResponseDto;
    onCancel?: () => void;
}

export function ComplectEditWidget({
    complect,
    onCancel,


}: IComplectEditWidgetProps) {
    const router = useRouter();
    const updateComplect = useUpdateComplect();
    const [hiddenIncludeInfoblocks, setHiddenIncludeInfoblocks] = React.useState(!complect.withDefault)


    const complectId = complect.id;

    const handleSubmit = (data: CreateComplectDto) => {
        updateComplect.mutate(
            { id: complectId, dto: data },
            {
                onSuccess: () => {
                    router.push(`${path}/${complectId}`);
                },
            },
        );
    };
    return (
        <div >
            <div className="w-full flex flex-row gap-4 justify-between p-4">
                <div>
                    <p className="text-sm text-foreground/50">Комплект: {complect.name}</p>
                    <p className="text-sm text-foreground/50">Вес: {complect.weight}</p>
                    <p className="text-sm text-foreground/50">Тип: {complect.type}</p>
                    <p className="text-sm text-foreground/50">Тип продукта: {complect.productType}</p>
                </div>
                <div onClick={() => setHiddenIncludeInfoblocks(!hiddenIncludeInfoblocks)} className="cursor-pointer flex flex-row gap-2 items-center">
                    <p>
                        {!hiddenIncludeInfoblocks ? 'Скрыть наполнение комплекта' : 'Показать наполнение комплекта'}

                    </p>
                    <Button variant="outline"> {!hiddenIncludeInfoblocks ? <EyeClosed /> : <Eye />}</Button>
                </div>
            </div>
            <div className="flex flex-row gap-4 ">
                <div className="w-full ">

                    <ComplectForm
                        mode="edit"
                        initialData={getToCreateComplect(complect, CreateComplectDtoProductType.garant, CreateComplectDtoType.prof)}
                        onSubmit={handleSubmit}
                        onCancel={onCancel}
                        isLoading={updateComplect.isPending}
                    />
                </div>
                {!hiddenIncludeInfoblocks && <ComplectInfoblocksForm complectId={complectId} onCancel={onCancel} />}
            </div>
        </div>

    );
}
