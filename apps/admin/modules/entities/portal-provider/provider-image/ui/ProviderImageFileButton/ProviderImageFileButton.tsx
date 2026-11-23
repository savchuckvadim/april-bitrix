'use client';

import { Button } from '@workspace/ui/components/button';
import { PROVIDER_IMAGE_ACCEPT } from '../../model';
import { useProviderImageFilePicker } from './hooks/use-provider-image-file-picker';

interface ProviderImageFileButtonProps {
    label: string;
    disabled?: boolean;
    onPick: (file: File) => void;
}

/** Кнопка с выбором файла: диалог сразу показывает только PNG и JPG. */
export function ProviderImageFileButton({
    label,
    disabled = false,
    onPick,
}: ProviderImageFileButtonProps) {
    const picker = useProviderImageFilePicker(onPick);

    return (
        <>
            <input
                ref={picker.input}
                type="file"
                accept={PROVIDER_IMAGE_ACCEPT}
                className="hidden"
                onChange={picker.onChange}
            />
            <Button size="sm" variant="outline" disabled={disabled} onClick={picker.open}>
                {label}
            </Button>
        </>
    );
}
