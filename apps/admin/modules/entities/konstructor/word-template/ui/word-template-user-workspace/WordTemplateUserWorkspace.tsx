'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { usePortal } from '@/modules/entities/portal';
import {
    useDepartmentUsers,
    useUserSelectedTemplateActions,
    useUserWordTemplates,
} from '../../lib/hooks';
import {
    formatDepartmentUser,
    mergeUserSelection,
} from '../../lib/utils/word-template-user-selection';
import type { IUserSelectedTemplateRequest } from '../../model';

interface WordTemplateUserWorkspaceProps {
    portalId: string;
}

/**
 * Шаблоны КП ОТ ЛИЦА пользователя портала.
 *
 * То же, что менеджер видит у себя в конструкторе (текущий шаблон,
 * избранное, активность), только выбирает пользователя админ. Список
 * пользователей — отдел продаж портала из Bitrix (`bitrix/department/sales`
 * по домену портала). Действия идут в те же ручки, что и у самого
 * пользователя, с явным `bitrix_user_id`.
 */
export function WordTemplateUserWorkspace({ portalId }: WordTemplateUserWorkspaceProps) {
    const [userId, setUserId] = React.useState<string>('');

    const portal = usePortal(Number(portalId));
    const domain = portal.data?.domain ?? undefined;
    const users = useDepartmentUsers(domain);
    const userTemplates = useUserWordTemplates(userId, portalId);
    const actions = useUserSelectedTemplateActions();

    const rows = React.useMemo(
        () =>
            mergeUserSelection(
                userTemplates.data?.templates ?? [],
                userTemplates.data?.selected ?? [],
            ),
        [userTemplates.data],
    );

    const requestFor = (templateId: string): IUserSelectedTemplateRequest => ({
        bitrix_user_id: Number(userId),
        portal_id: Number(portalId),
        offer_template_id: Number(templateId),
    });

    const busy =
        actions.setCurrent.isPending || actions.setFavorite.isPending || actions.setActive.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Шаблоны от лица пользователя</CardTitle>
                <CardDescription>
                    Выберите сотрудника отдела продаж — увидите его шаблоны с текущим, избранным
                    и активностью, как в конструкторе, и сможете изменить их за него.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="workspace-user">Пользователь</Label>
                    <Select value={userId} onValueChange={setUserId} disabled={!domain}>
                        <SelectTrigger id="workspace-user" className="max-w-xl">
                            <SelectValue
                                placeholder={
                                    !domain
                                        ? 'У портала не задан домен — отдел не загрузить'
                                        : users.isLoading
                                          ? 'Загружаем отдел продаж…'
                                          : 'Выберите пользователя'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {(users.data ?? []).map((user) => (
                                <SelectItem key={user.ID} value={String(user.ID)}>
                                    {formatDepartmentUser(user)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {users.isError && (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить отдел продаж портала.
                        </p>
                    )}
                </div>

                {userId && (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-2 text-left">Шаблон</th>
                                    <th className="p-2 text-left">Видимость</th>
                                    <th className="p-2 text-left">Текущий</th>
                                    <th className="p-2 text-left">Избранное</th>
                                    <th className="p-2 text-left">Активен</th>
                                    <th className="p-2 text-left">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userTemplates.isLoading && (
                                    <tr>
                                        <td className="p-4 text-muted-foreground" colSpan={6}>
                                            Загрузка…
                                        </td>
                                    </tr>
                                )}
                                {!userTemplates.isLoading && rows.length === 0 && (
                                    <tr>
                                        <td className="p-4 text-muted-foreground" colSpan={6}>
                                            Этому пользователю на портале не доступен ни один шаблон.
                                        </td>
                                    </tr>
                                )}
                                {rows.map((row) => {
                                    const id = String(row.template.id);
                                    return (
                                        <tr key={id} className="border-t">
                                            <td className="p-2">
                                                <div className="font-medium">{row.template.name}</div>
                                                <div className="text-xs text-muted-foreground">#{id}</div>
                                            </td>
                                            <td className="p-2">{row.template.visibility}</td>
                                            <td className="p-2">{row.isCurrent ? 'Да' : '—'}</td>
                                            <td className="p-2">{row.isFavorite ? 'Да' : '—'}</td>
                                            <td className="p-2">{row.isActive ? 'Да' : '—'}</td>
                                            <td className="p-2">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={busy || row.isCurrent}
                                                        onClick={() =>
                                                            actions.setCurrent.mutate(requestFor(id))
                                                        }
                                                    >
                                                        {row.isCurrent ? 'Текущий' : 'Сделать текущим'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            actions.setFavorite.mutate({
                                                                req: requestFor(id),
                                                                isFavorite: !row.isFavorite,
                                                            })
                                                        }
                                                    >
                                                        {row.isFavorite ? 'Из избранного' : 'В избранное'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            actions.setActive.mutate({
                                                                req: requestFor(id),
                                                                isActive: !row.isActive,
                                                            })
                                                        }
                                                    >
                                                        {row.isActive ? 'Деактивировать' : 'Активировать'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
