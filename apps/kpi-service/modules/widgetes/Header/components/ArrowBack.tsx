'use client';

import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const ArrowBack = () => {
    const router = useRouter();
    return (

        <Button
            variant="ghost"
            onClick={() => router.back()}
            className="h-7 flex items-center justify-between gap-2 cursor-pointer text-primary hover:text-primary/80">
            <ArrowLeft className='size-4 ' />
            <p className="text-sm font-medium">Назад</p>
        </Button>

    )
}
