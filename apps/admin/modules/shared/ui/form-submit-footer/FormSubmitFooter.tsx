import { Button } from '@workspace/ui';


export interface ComplectFormFooterProps {
    onCancel?: () => void;
    isLoading: boolean;
    mode: 'create' | 'edit';
}
export const FormSubmitFooter = ({ onCancel, isLoading, mode }: ComplectFormFooterProps) => {
    return (
        <div className="w-full flex gap-2 justify-end">
            {onCancel && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Отмена
                </Button>
            )}
            <Button type="submit" disabled={isLoading}>
                {isLoading
                    ? 'Сохранение...'
                    : mode === 'create'
                        ? 'Создать'
                        : 'Сохранить'}
            </Button>
        </div>
    );
};
