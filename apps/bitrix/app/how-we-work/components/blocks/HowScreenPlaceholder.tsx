import React from 'react';
import { ImageIcon } from 'lucide-react';

interface HowScreenPlaceholderProps {
    /** Что должно быть на скриншоте */
    label: string;
}

/**
 * Плейсхолдер под скриншот интерфейса.
 * Заменяется реальным изображением при наполнении сайта.
 */
export const HowScreenPlaceholder: React.FC<HowScreenPlaceholderProps> = ({
    label,
}) => (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-6 text-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        <p className="max-w-md text-sm text-muted-foreground">{label}</p>
    </div>
);
