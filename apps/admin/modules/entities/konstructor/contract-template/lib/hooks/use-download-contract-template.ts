'use client';

import { useMutation } from '@tanstack/react-query';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

/** `demo: true` — заполненный пример вместо самого шаблона. */
export const useDownloadContractTemplate = () => {
    return useMutation({
        mutationFn: ({ id, demo }: { id: string; demo?: boolean }) =>
            helper.download(id, demo),
    });
};
