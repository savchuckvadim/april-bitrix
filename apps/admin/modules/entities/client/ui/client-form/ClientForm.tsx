'use client';

import { useForm } from 'react-hook-form';
import { CreateClientDto, UpdateClientDto } from '@workspace/nest-admin-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { type ClientFormValues, toClientDto } from './client-form.values';

interface ClientFormProps {
    initialData?: Partial<ClientFormValues>;
    onSubmit: (data: CreateClientDto | UpdateClientDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

/**
 * Организация-клиент: название, email (уникален на всю базу) и, при
 * правке, «действует». Порталы и доступы — на странице клиента и во
 * вкладке «Кабинет» портала.
 */
export function ClientForm({ initialData, onSubmit, onCancel, isLoading = false, mode = 'create' }: ClientFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClientFormValues>({
        defaultValues: { name: '', email: '', isActive: true, ...initialData },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === 'create' ? 'Новый клиент' : 'Клиент'}</CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Организация, которой принадлежат порталы. Портал привяжете на странице клиента или во вкладке «Кабинет» портала.'
                        : 'Название и email организации.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(values => onSubmit(toClientDto(values, mode)))}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-name">Название организации</Label>
                        <Input
                            id="client-name"
                            placeholder="Альфа-Центр"
                            {...register('name', {
                                validate: value => value.trim().length > 0 || 'Укажите название',
                            })}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-email">Email (если есть)</Label>
                        <Input id="client-email" type="email" placeholder="director@example.ru" {...register('email')} />
                        <p className="text-xs text-muted-foreground">Уникален на всю базу.</p>
                    </div>
                    {mode === 'edit' && (
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...register('isActive')} />
                            Действует
                        </label>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
