'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { CatalogTableKind, catalogTableInfo } from '../../model';

interface CatalogTableLinkProps {
    /** Какая таблица откроется на странице массовых правок */
    kind: CatalogTableKind;
}

/**
 * Ссылка со страницы сущности на массовое обновление таблицей —
 * чтобы со списка было видно, где править много значений сразу.
 */
export function CatalogTableLink({ kind }: CatalogTableLinkProps) {
    return (
        <Button variant="outline" asChild>
            <Link href={`/garant/catalog-tables?table=${kind}`}>
                Обновить таблицей
            </Link>
        </Button>
    );
}

/** Подпись таблицы — для подсказок на страницах сущностей */
export const catalogTableTitle = (kind: CatalogTableKind): string =>
    catalogTableInfo(kind).title;
