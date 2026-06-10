import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Shield, AlertTriangle } from 'lucide-react';
import Image from 'next/image';


export default function NoneAuthPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Логотип */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-16 h-16">
                        <Image
                            src="/logo/logo.svg"
                            alt="Alfacentr Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Основная карточка */}
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Доступ ограничен
                        </CardTitle>
                        <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-2">
                            Для доступа к этой странице требуется авторизация
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Информационный блок */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium mb-1">
                                        Безопасность
                                    </p>
                                    <p>
                                        Эта страница защищена системой
                                        авторизации для обеспечения безопасности
                                        данных.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Кнопка "Назад" */}
                        {/* <div className="flex justify-center">
              <BackButton />
            </div> */}

                        {/* Дополнительная информация */}
                        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p>
                                Если у вас есть вопросы, обратитесь к
                                администратору системы
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Футер */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © 2024 Alfacentr. Все права защищены.
                    </p>
                </div>
            </div>
        </div>
    );
}
