'use client';

import * as React from 'react';
import { AButton, AModal, PreloaderMicro } from '@workspace/april-ui';
import { AiSettingsDocumentParams } from '@workspace/nest-api';
import { useAiMaterialsContent } from '../../lib/hooks/use-ai-materials';

interface MaterialViewModalProps {
    /** null — модалка закрыта. */
    target: AiSettingsDocumentParams | null;
    onClose: () => void;
}

/** Просмотр извлечённого текста материала (свои и общие — только чтение). */
export function MaterialViewModal({ target, onClose }: MaterialViewModalProps) {
    const { data, isLoading, error } = useAiMaterialsContent(target);

    return (
        <AModal
            color="white"
            size="lg"
            isActive={target !== null}
            cancel={onClose}
        >
            <div className="flex flex-col gap-3">
                <div>
                    <h2 className="text-lg font-semibold">
                        {target?.fileName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Раздел: {target?.kind} · Портал: {target?.domain}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <PreloaderMicro phrase="Загружаем текст…" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-600">
                        Не удалось получить текст: {error.message}
                    </p>
                ) : (
                    <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm">
                        {data?.text || 'Текст не извлечён'}
                    </pre>
                )}

                <div className="flex justify-end">
                    <div className="w-32">
                        <AButton title="Закрыть" clickHendler={onClose} />
                    </div>
                </div>
            </div>
        </AModal>
    );
}
