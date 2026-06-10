import { useState } from 'react';
import { useBxApps } from '@/modules/entities/bx-app/lib/bx-app.hook';
import { CreateBitrixAppDto, CreateBitrixAppDtoCode, CreateBitrixAppDtoStatus, CreateBitrixAppDtoType } from '@workspace/nest-api';
import { usePortal } from '@/modules/entities/portal';
import { SubmitHandler, useForm } from 'react-hook-form';

interface OAuthConfig {
    client_id: string;
    client_secret: string;
    domain: string;
    handler_url: string;
    install_url: string;
    redirect_uri: string;
    scope: string[];
}

export function useCreateAppForm(portalId: string) {
    const { selectedPortal } = usePortal();
    const {
        storeOrUpdateApp: createApp,
        isLoadingStoreOrUpdateApp: isLoading,
        errorStoreOrUpdateApp
    } = useBxApps(Number(portalId));

    const [config, setConfig] = useState<OAuthConfig>({
        client_id: '',
        client_secret: '',
        domain: selectedPortal?.domain || '' as string,
        redirect_uri: '',
        handler_url: 'https://next.april-app.ru/sales' as string,
        install_url: 'https://back.april-app.ru/api/sales/install' as string,
        scope: ['crm', 'user', 'placement']
    });

    const [showSecret, setShowSecret] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isShowHandlerInstructions, setIsShowHandlerInstructions] = useState(false);
    const [isShowHandlerInstallerInstructions, setIsShowHandlerInstallerInstructions] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateBitrixAppDto>();

    const onSubmit: SubmitHandler<CreateBitrixAppDto> = async (data) => {
        const dto = {
            ...data,
            group: 'sales',
            type: CreateBitrixAppDtoType.full,
            code: CreateBitrixAppDtoCode.sales_full,
            status: CreateBitrixAppDtoStatus.active,
        } as CreateBitrixAppDto

        void await createApp(dto)
    }

    // Валидация домена
    const validateDomain = (domain: string) => {
        if (!domain) {
            setError('Домен обязателен');
            return false;
        }

        const domainRegex = /\.bitrix24\.[a-z]+$/.test(domain.trim().toLowerCase());
        if (!domainRegex) {
            setError('Неверный формат домена. Используйте: your-portal.bitrix24.ru');
            return domainRegex;
        }
        console.log('domain', domain);
        setError(null);
        return domainRegex;
    };

    // Обработка изменения домена
    const handleDomainChange = (value: string) => {
        const cleanDomain = value.trim().toLowerCase();
        setConfig(prev => ({ ...prev, domain: cleanDomain }));
        setValue("domain", value);
        if (cleanDomain) {
            validateDomain(cleanDomain);
            // Автоматически генерируем redirect_uri
            setConfig(prev => ({
                ...prev,
                redirect_uri: `https://${cleanDomain}/oauth/callback`
            }));
        }
    };

    // Копирование в буфер обмена
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Проверка подключения к порталу
    const testConnection = async () => {
        if (!config.domain) {
            setError('Сначала укажите домен портала');
            return;
        }

        try {
            // Имитация проверки подключения
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Здесь будет реальная проверка подключения к API Битрикс24
            const isConnected = Math.random() > 0.3; // Имитация результата

            if (isConnected) {
                setError(null);
            } else {
                setError('Не удалось подключиться к порталу. Проверьте домен и настройки');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            setError('Ошибка проверки подключения');
        } finally {
            // setIsLoading(false);
        }
    };

    return {
        config,
        setConfig,
        showSecret,
        setShowSecret,
        isSaved,
        setIsSaved,
        error,
        setError,
        isShowHandlerInstructions,
        setIsShowHandlerInstructions,
        isShowHandlerInstallerInstructions,
        setIsShowHandlerInstallerInstructions,
        register,
        handleSubmit,
        watch,
        setValue,
        errors,
        onSubmit,
        validateDomain,
        handleDomainChange,
        copyToClipboard,
        testConnection,
        isLoading,
        selectedPortal,
    };
}

export type UseCreateAppFormReturn = ReturnType<typeof useCreateAppForm>;

