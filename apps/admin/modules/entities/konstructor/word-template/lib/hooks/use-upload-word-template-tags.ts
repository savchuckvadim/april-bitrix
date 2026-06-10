'use client';

import { useMutation } from '@tanstack/react-query';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useUploadWordTemplateTags = () => {
    return useMutation({
        mutationFn: async (file: File) => {
            const response = await helper.uploadTags(file);
            return response;
        },
    });
};
