'use client';

import { Button } from '@workspace/ui/components/button';
import { PROVIDER_IMAGE_LEGACY_TEXT } from '@/modules/entities/portal-provider/provider-image';
import { useLegacyImportFolderPicker } from '../hooks/use-legacy-import-folder-picker';
import { FOLDER_INPUT_PROPS } from '../lib/folder-input.consts';

interface LegacyImportFolderPickerProps {
    /** Уже выбрана папка: кнопка зовёт выбрать другую */
    hasSelection: boolean;
    disabled: boolean;
    onPick: (files: File[]) => void;
}

/** Кнопка выбора папки легаси: диалог системы отдаёт все файлы папки с вложенными. */
export function LegacyImportFolderPicker({
    hasSelection,
    disabled,
    onPick,
}: LegacyImportFolderPickerProps) {
    const picker = useLegacyImportFolderPicker(onPick);

    return (
        <>
            <input
                {...FOLDER_INPUT_PROPS}
                ref={picker.input}
                className="hidden"
                onChange={picker.onChange}
            />
            <Button variant="outline" disabled={disabled} onClick={picker.open}>
                {hasSelection
                    ? PROVIDER_IMAGE_LEGACY_TEXT.repickFolder
                    : PROVIDER_IMAGE_LEGACY_TEXT.pickFolder}
            </Button>
        </>
    );
}
