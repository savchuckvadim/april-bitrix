'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import type { VendorSettingGroup } from '../../model';
import { VendorSettingField } from './VendorSettingField';

interface VendorSettingGroupCardProps {
    group: VendorSettingGroup;
    secretMask: string;
}

/** Группа настроек: заголовок, зачем она нужна и её поля. */
export function VendorSettingGroupCard({ group, secretMask }: VendorSettingGroupCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {group.items.map((item) => (
                    <VendorSettingField key={item.key} setting={item} secretMask={secretMask} />
                ))}
            </CardContent>
        </Card>
    );
}
