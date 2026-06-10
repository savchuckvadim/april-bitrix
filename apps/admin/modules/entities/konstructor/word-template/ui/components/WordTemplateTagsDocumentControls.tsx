'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    useDownloadWordTemplateTags,
    useUploadWordTemplateTags,
} from '../../lib/hooks';
import { downloadFromResponse } from '../../lib/utils';

export function WordTemplateTagsDocumentControls() {
    const [file, setFile] = React.useState<File | null>(null);
    const downloadTagsDocument = useDownloadWordTemplateTags();
    const uploadTagsDocument = useUploadWordTemplateTags();

    const handleDownload = async () => {
        const response = await downloadTagsDocument.mutateAsync();
        downloadFromResponse(response, 'word-template-tags.docx');
    };

    const handleUpload = async () => {
        if (!file) return;
        await uploadTagsDocument.mutateAsync(file);
        setFile(null);
    };

    return (
        <div className="rounded-lg border p-4">
            <div className="mb-3">
                <h2 className="text-lg font-semibold">Документ тегов</h2>
                <p className="text-sm text-muted-foreground">
                    Общий документ для всех Word шаблонов.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[280px] flex-1 space-y-1">
                    <Label htmlFor="word-template-tags-file">DOCX файл</Label>
                    <Input
                        id="word-template-tags-file"
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloadTagsDocument.isPending}
                >
                    {downloadTagsDocument.isPending ? 'Скачивание...' : 'Скачать документ'}
                </Button>
                <Button
                    onClick={handleUpload}
                    disabled={!file || uploadTagsDocument.isPending}
                >
                    {uploadTagsDocument.isPending ? 'Загрузка...' : 'Загрузить новый'}
                </Button>
            </div>
        </div>
    );
}
