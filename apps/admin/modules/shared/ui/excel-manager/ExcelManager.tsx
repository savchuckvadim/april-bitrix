'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';

interface ExcelManagerProps {
    /**
     * Функция для скачивания примера Excel файла
     */
    onDownloadExample: () => void;
    /**
     * Функция для загрузки Excel файла
     */
    onUploadExcel: (file: File) => void;
    /**
     * Функция для обновления данных из Excel
     */
    onUpdateByExcel: () => void;
    /**
     * Состояние загрузки для скачивания примера
     */
    isDownloading?: boolean;
    /**
     * Состояние загрузки для загрузки файла
     */
    isUploading?: boolean;
    /**
     * Состояние загрузки для обновления
     */
    isUpdating?: boolean;
    /**
     * Текст для кнопки скачивания примера
     */
    downloadButtonText?: string;
    /**
     * Текст для кнопки загрузки
     */
    uploadButtonText?: string;
    /**
     * Текст для кнопки обновления
     */
    updateButtonText?: string;
    /**
     * Заголовок диалога
     */
    dialogTitle?: string;
    /**
     * Описание диалога
     */
    dialogDescription?: string;
}

export function ExcelManager({
    onDownloadExample,
    onUploadExcel,
    onUpdateByExcel,
    isDownloading = false,
    isUploading = false,
    isUpdating = false,
    downloadButtonText = 'Скачать пример',
    uploadButtonText = 'Загрузить Excel',
    updateButtonText = 'Обновить по Excel',
    dialogTitle = 'Управление Excel',
    dialogDescription = 'Скачайте пример, загрузите свой файл или обновите данные из Excel',
}: ExcelManagerProps) {
    const [file, setFile] = React.useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = () => {
        if (file) {
            onUploadExcel(file);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setIsDialogOpen(false);
        }
    };

    const handleDownloadExample = () => {
        onDownloadExample();
    };

    const handleUpdateByExcel = () => {
        onUpdateByExcel();
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Управление Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                        {dialogDescription}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadExample}
                            disabled={isDownloading}
                            className="w-full"
                        >
                            {isDownloading ? 'Скачивание...' : downloadButtonText}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excel-file">Выберите Excel файл</Label>
                        <Input
                            id="excel-file"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={isUploading}
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Выбран файл: {file.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            onClick={handleUpdateByExcel}
                            disabled={isUpdating}
                            className="w-full"
                        >
                            {isUpdating ? 'Обновление...' : updateButtonText}
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? 'Загрузка...' : uploadButtonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
