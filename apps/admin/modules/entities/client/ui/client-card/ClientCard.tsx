'use client';

import * as React from 'react';
import { ClientResponseDto, ClientWithRelationsResponseDto } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

interface ClientCardProps {
    item: ClientWithRelationsResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function ClientCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: ClientCardProps) {
    return (
        <div className="min-w-full flex flex-col gap-4">


            <div className="min-w-full flex flex-row gap-4">


                <Card className="w-1/2 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    {/* TODO: Замените на поле с именем/названием */}
                                    ID: {item.id}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {/* TODO: Добавьте описание */}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ID:</span>
                                <span className="font-medium">{item.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{item.email ?? ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium">{item.status ?? ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Is Active:</span>
                                <span className="font-medium">{item.is_active}</span>
                            </div>
                        </div>



                    </CardContent>
                    <CardFooter className="flex gap-2">
                        {onViewDetails && (
                            <Button variant="outline" onClick={onViewDetails} className="flex-1">
                                Подробнее
                            </Button>
                        )}
                        {onEdit && (
                            <Button variant="outline" onClick={onEdit} className="flex-1">
                                Изменить
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="destructive"
                                onClick={onDelete}
                                className="flex-1"
                            >
                                Удалить
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <Card className="w-1/2 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div>
                            <Link href={`/portal/${item.portal?.id}`}>
                                <h2
                                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                                    className="text-blue-500 hover:text-blue-700 text-xl font-bold"
                                >Portal: {item.portal?.domain as string}</h2>
                            </Link>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID:</span>
                                    <span className="font-medium">{item.portal?.id as number || '-'}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Domain:</span>
                                    <span className="font-medium">{item.portal?.domain as string || '-'}</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created At:</span>
                                    <span className="font-medium">{item.portal?.created_at ? new Date(item.portal?.created_at as string).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Key:</span>
                                    <span className="font-medium">{item.portal?.key as string || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>




            </div>
            <div className="space-y-2 text-sm">
                <Card>
                    <CardContent>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Users:</span>
                            <span className="font-medium">{item.users?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">

                    {item.users && item.users.length > 0
                        ? item.users?.map(user => <Card
                            className=" hover:shadow-md transition-shadow w-[300px]"
                        >

                            <CardHeader>
                                <CardTitle>
                                    {/* <Link
                                        style={{ textDecoration: 'none', cursor: 'pointer' }}
                                        href={`/user/${user.id}`}
                                        className="text-blue-500 hover:text-blue-700"
                                    > */}
                                    {user.name} {user.surname}
                                    {/* </Link> */}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    {user.email}
                                </p>
                                <p>
                                    {user.email_verified_at ? new Date(user.email_verified_at).toLocaleDateString() : '-'}
                                </p>
                                <p>
                                    {user.bitrix_id}
                                </p>
                                <p>
                                    {user.client_id}
                                </p>
                            </CardContent>
                        </Card>)
                        : 'Нет пользователей'


                    }
                </div>

            </div>
        </div>
    );
}
