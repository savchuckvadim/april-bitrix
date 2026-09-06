import { Info } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';

interface FeatureDisabledScreenProps {
    /** Название раздела — в заголовок заглушки. */
    title: string;
}

/**
 * Заглушка раздела, выключенного фич-флагом: страница остаётся
 * доступной по адресу, но спокойно объясняет, почему пуста.
 */
export const FeatureDisabledScreen = ({ title }: FeatureDisabledScreenProps) => (
    <div className="space-y-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Alert>
            <Info className="size-4" />
            <AlertTitle>Фича выключена</AlertTitle>
            <AlertDescription>
                Раздел отключён флагом приложения (NEXT_PUBLIC_FEATURE_*). Чтобы
                включить, задайте переменную окружения и пересоберите админку.
            </AlertDescription>
        </Alert>
    </div>
);
