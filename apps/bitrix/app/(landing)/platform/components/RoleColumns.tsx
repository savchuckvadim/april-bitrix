import { Card, CardContent } from '@workspace/ui/components/card';
import type { PlatformRoleValue } from '../model/types';

export interface RoleColumnsProps {
    roles: readonly PlatformRoleValue[];
}

/** Что получает каждая роль: менеджер, руководитель, собственник. */
export function RoleColumns({ roles }: RoleColumnsProps) {
    return (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {roles.map(role => (
                <Card key={role.role} className="h-full py-0">
                    <CardContent className="flex flex-col gap-4 p-6">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                            {role.role}
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">{role.title}</h3>
                        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground marker:text-primary">
                            {role.items.map(item => (
                                <li key={item} className="text-pretty">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
