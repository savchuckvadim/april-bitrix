'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IGarantPackage } from '../../model';
import { usePackages } from '../../lib/hooks';
import { PackageTable } from '../package-table/PackageTable';
import { PACKAGE_LIST_PATH } from '../../consts/package.consts';
import { Button } from '@workspace/ui/index';

const path = PACKAGE_LIST_PATH;

export function PackageList() {
    const router = useRouter();
    const { data: packages, isLoading } = usePackages();

    const handleRowClick = (pkg: IGarantPackage) => {
        router.push(`${path}/${pkg.id}`);
    };

    const handleCreate = () => {
        router.push(`${path}/new`);
    };

    const handleEdit = (pkg: IGarantPackage) => {
        router.push(`${path}/${pkg.id}/edit`);
    };

    const handleDelete = (pkg: IGarantPackage) => {
        router.push(`${path}/${pkg.id}/delete`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Packages</h1>
                <Button onClick={handleCreate}>
                    Create Package
                </Button>
            </div>

            <PackageTable
                data={Array.isArray(packages) ? packages : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
