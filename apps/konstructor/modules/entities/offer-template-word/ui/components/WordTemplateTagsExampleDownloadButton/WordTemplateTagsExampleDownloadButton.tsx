'use client';

import React, { useRef, useState } from 'react';
import { useDownloadTagsForTemplates } from '../../../hooks/useDownloadTagsForTemplates';

import { uploadTagsForTemplatesAPI } from '../../../lib/word-template-api';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app';

export const WordTemplateTagsExampleDownloadButton: React.FC = () => {
    const { downloadTagsExample, isDownloading } = useDownloadTagsForTemplates();
    const isSuperUser = useAppSelector((state) => state.app.isSuperUser);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleDownloadClick = async () => {
        try {
            await downloadTagsExample();
        } catch (error) {
            console.error('Failed to download tags example:', error);
            alert('Ошибка при скачивании примера с тегами');
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            await uploadTagsForTemplatesAPI(file);
            alert('Файл тегов успешно загружен');
        } catch (error) {
            console.error('Failed to upload tags file:', error);
            alert('Ошибка при загрузке файла тегов');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadClick}
                disabled={isDownloading}
            >
                {isDownloading ? 'Скачивание...' : 'Скачать пример тегов'}
            </Button>

            {isSuperUser && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleUploadClick}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Загрузка...' : 'Загрузить файл тегов'}
                    </Button>
                </>
            )}
        </div>
    );
};
