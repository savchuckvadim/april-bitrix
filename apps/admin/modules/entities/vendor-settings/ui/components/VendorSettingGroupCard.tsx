'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { TELEGRAM_BOTS_GROUP, type VendorSettingGroup } from '../../model';
import { TelegramBotsOverview } from './TelegramBotsOverview';
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
                {group.group === TELEGRAM_BOTS_GROUP && <TelegramBotsOverview />}
                {group.items.map((item) => (
                    <VendorSettingField key={item.key} setting={item} secretMask={secretMask} />
                ))}
            </CardContent>
        </Card>
    );
}
