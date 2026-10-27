'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { CATALOG_TABLES, DEFAULT_CATALOG_TABLE } from '../../model';
import { CatalogTableCard } from '../catalog-table-card/CatalogTableCard';
import { CatalogSeedCard } from '../catalog-seed-card/CatalogSeedCard';

/**
 * Каталог «Гарант»: массовое обновление таблицами. Точечные правки
 * остаются на страницах цен, комплектов, поставок и регионов.
 */
export function CatalogTablesPage() {
    // Со страниц цен/поставок/регионов приходят с ?table=<вид>, чтобы
    // сразу открыть нужную таблицу.
    const searchParams = useSearchParams();
    const requested = searchParams.get('table');
    const initialTab =
        CATALOG_TABLES.find(table => table.kind === requested)?.kind ??
        DEFAULT_CATALOG_TABLE.kind;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">Таблицы каталога</h1>
                <p className="text-muted-foreground">
                    Массовое обновление цен и справочников: скачиваете файл с
                    текущими данными, правите и загружаете обратно.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Как это работает</CardTitle>
                    <CardDescription>
                        Одинаково для всех таблиц на этой странице.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="list-decimal space-y-1 pl-5 text-sm">
                        <li>
                            <span className="font-medium">Скачайте файл.</span>{' '}
                            С текущими данными — чтобы поправить то, что есть.
                            У цен есть и пустой вариант: те же строки и
                            колонки, но без значений, для нового прайса.
                        </li>
                        <li>
                            <span className="font-medium">Правьте в нём.</span>{' '}
                            Меняйте значения в ячейках, не трогая первую
                            колонку и заголовки — по ним система понимает, к
                            чему относится строка.
                        </li>
                        <li>
                            <span className="font-medium">Проверьте.</span>{' '}
                            Покажем, сколько строк добавится и изменится, и что
                            не получилось разобрать. Ничего не сохраняем.
                        </li>
                        <li>
                            <span className="font-medium">Сохраните.</span>{' '}
                            Применяем проверенный файл к каталогу.
                        </li>
                    </ol>

                    <Alert>
                        <AlertDescription>
                            <span className="font-medium">
                                Пустая ячейка значит «не менять».
                            </span>{' '}
                            Так можно прислать файл только с теми значениями,
                            которые правили. Чтобы удалить строку, откройте её
                            на странице этой сущности — загрузка файла ничего
                            не удаляет.
                        </AlertDescription>
                    </Alert>

                    <div className="text-muted-foreground space-y-1 text-sm">
                        <p className="font-medium text-foreground">
                            Что ещё полезно знать
                        </p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                Загрузить тот же файл дважды безопасно: во
                                второй раз система увидит, что всё совпадает, и
                                ничего не перезапишет.
                            </li>
                            <li>
                                Если строку не удалось разобрать, остальные
                                всё равно применятся, а по ней будет написана
                                причина.
                            </li>
                            <li>
                                В книге есть лист «как заполнять» с
                                подсказками — на разбор файла он не влияет.
                            </li>
                            <li>
                                Одно значение быстрее поправить на странице
                                самой сущности; таблицы — для массовых правок.
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue={initialTab}>
                <TabsList>
                    {CATALOG_TABLES.map(table => (
                        <TabsTrigger key={table.kind} value={table.kind}>
                            {table.title}
                        </TabsTrigger>
                    ))}
                    <TabsTrigger value="seed">Первое наполнение</TabsTrigger>
                </TabsList>

                {CATALOG_TABLES.map(table => (
                    <TabsContent key={table.kind} value={table.kind}>
                        <CatalogTableCard table={table} />
                    </TabsContent>
                ))}
                <TabsContent value="seed">
                    <CatalogSeedCard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
