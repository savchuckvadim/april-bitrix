'use client';

import { useMutation } from '@tanstack/react-query';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useDownloadWordTemplate = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await helper.download(id);
            return response;
        },
    });
};
