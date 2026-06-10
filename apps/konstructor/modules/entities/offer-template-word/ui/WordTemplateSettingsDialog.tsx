'use client';

import React from 'react';
import { wordTemplateAC } from '../model/WordTemplateSlice';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { WordTemplateSettingsWidgetLoadable } from './WordTemplateSettingsWidget.loadable';
import { useAppDispatch, useAppSelector } from '@/modules/app';

export const WordTemplateSettingsDialog: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isSettingsOpen } = useAppSelector((state) => state.offerTemplateWord);

    const handleClose = () => {
        dispatch(wordTemplateAC.setSettingsOpen(false));
    };

    if (!isSettingsOpen) {
        return null;
    }

    return (
        <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                showCloseButton
                className="flex max-h-[min(90vh,920px)] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,56rem)]"
            >
                <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                        Настройки Word шаблонов
                    </DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-auto px-4 py-4 sm:px-6">
                    <WordTemplateSettingsWidgetLoadable />
                </div>
            </DialogContent>
        </Dialog>
    );
};
