'use client';

import { Check, FileSignature } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useContractGenerate } from '../hooks/use-contract-generate';
import { ContractGenerateStatus } from './ContractGenerateStatus';

/** «Сформировать договор»: блокер, ошибка, ссылка на результат. */
export const ContractGenerateButton = () => {
    const generate = useContractGenerate();

    return (
        <div className="flex flex-col gap-2">
            <Button
                className="w-full"
                onClick={() => void generate.run()}
                disabled={Boolean(generate.blocker) || generate.isGenerating}
            >
                {generate.isDone ? <Check className="h-4 w-4" /> : <FileSignature className="h-4 w-4" />}
                {generate.isGenerating ? 'Формирую…' : 'Сформировать договор'}
            </Button>
            <ContractGenerateStatus
                blocker={generate.blocker}
                error={generate.error}
                isDone={generate.isDone}
                link={generate.link}
                documentName={generate.documentName}
                savedToDisk={generate.savedToDisk}
            />
        </div>
    );
};
