import { useEffect, useState } from 'react';
import { bxInstallHelper } from '../api/bx-install.helper';
import { useQuery } from '@tanstack/react-query';

/**
 * Завершение установки: вызывает BX24.installFinish() (через bxInstallHelper).
 *
 * @param enabled false — НЕ вызывать installFinish (например, когда бэк
 * вернул ?install=fail: провальную установку нельзя финализировать).
 */
export const useBxInstall = (enabled: boolean = true) => {
    const mounted = useClientMounted();
    const query = useQuery<unknown, Error>({
        queryKey: ['install'],
        queryFn: bxInstallHelper,
        // installFinish строго один раз и только на клиенте внутри iframe
        enabled: enabled && mounted,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
    return {
        isInstalled: query.isSuccess,
        isLoading: enabled && query.isLoading,
        error: query.error,
    };
};

/**
 * true после маунта на клиенте. Инициализацию B24-фрейма выполняет сам
 * bxInstallHelper (initializeB24Frame внутри bxAPI.install) — отдельного
 * ожидания BX24 здесь не требуется.
 */
const useClientMounted = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted;
};
