
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Settings, Plus, Eye, BarChart3, Shield, HeadphonesIcon, Briefcase, Megaphone } from "lucide-react";
import Link from "next/link";
import { getAppGroupLabel, getStatusColor, getStatusLabel } from "@/modules/shared";
import { BitrixApp } from "@/modules/entities/entities";
import { Badge } from "@workspace/ui/components/badge";
const getAppIcon = (group: string) => {
    const icons = {
        sales: Briefcase,
        service: HeadphonesIcon,
        marketing: Megaphone,
        support: Shield,
        analytics: BarChart3
    };
    return icons[group as keyof typeof icons] || Briefcase;
};


export const CurrentApps = ({ apps, portalId }: { apps: BitrixApp[], portalId: number }) => {
    return <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Мои Приложения
                </CardTitle>
                <Link href="/bitrix/placement/list">
                    <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить
                    </Button>
                </Link>
            </div>
            <CardDescription>
                Управление установленными виджетами
            </CardDescription>
        </CardHeader>
        <CardContent>
            {apps.length > 0 ? (
                <div className="space-y-4">
                    {apps.map((app) => {
                        const AppIcon = getAppIcon(app.group);
                        return (
                            <div key={app.id.toString()} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AppIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{getAppGroupLabel(app.group)}</h3>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                                                {getStatusLabel(app.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    {app.code} • {app.type}
                                </p>
                                <div className="flex gap-2">
                                    <Link href={`/standalone/portal/${app.portal_id}/app/${app.id}`}>
                                        <Button size="sm" variant="outline">
                                            <Settings className="w-4 h-4 mr-1" />
                                            Управление
                                        </Button>
                                    </Link>
                                    <Button size="sm" variant="ghost">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Нет установленных приложений</p>
                    <Link href={`/standalone/portal/${portalId}/app/create/`} className="mt-4 block">
                        <Button variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Создать приложение
                        </Button>
                    </Link>
                </div>
            )}
        </CardContent>
    </Card>

}
