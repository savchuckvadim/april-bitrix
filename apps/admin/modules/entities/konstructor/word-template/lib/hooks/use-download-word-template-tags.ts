'use client';

import { useMutation } from '@tanstack/react-query';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useDownloadWordTemplateTags = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await helper.downloadTags();
            return response;
        },
    });
};
