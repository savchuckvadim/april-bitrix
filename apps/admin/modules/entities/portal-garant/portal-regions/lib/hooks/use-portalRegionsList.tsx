import { useRouter } from "next/navigation";
import React from "react";
import { useCreatePortalRegion, useDeletePortalRegion, usePortalRegions } from "./use-portalRegions";
import { GetPortalRegionResponseDto } from "@workspace/nest-admin-api";
import { useFilteredRegions, RegionOwnershipFilter, filterRegions } from "./use-filteredRegions";

export const usePortalRegionsList = (portalId: number) => {
    const router = useRouter();
    const { data: portalRegions, isLoading } = usePortalRegions({
        portalId,
    });
    const { mutate: createPortalRegion } = useCreatePortalRegion();
    const { mutate: deletePortalRegion } = useDeletePortalRegion();

    const [search, setSearch] = React.useState<string>('');
    const [ownershipFilter, setOwnershipFilter] = React.useState<RegionOwnershipFilter>('all');

    // Используем хук фильтрации для получения отфильтрованных регионов
    const filteredRegions = useFilteredRegions({
        regions: portalRegions,
        search,
        ownershipFilter,
    });

    // Локальное состояние для оптимистичных обновлений при изменении чекбоксов
    const [optimisticRegions, setOptimisticRegions] = React.useState<GetPortalRegionResponseDto[] | null>(null);

    // Объединяем оптимистичные обновления с отфильтрованными данными
    const regions = React.useMemo(() => {
        if (optimisticRegions) {
            return filterRegions({
                regions: optimisticRegions,
                search,
                ownershipFilter,
            });
        }
        return filteredRegions;
    }, [optimisticRegions, filteredRegions, search, ownershipFilter]);

    // Обработчики для взаимоисключающих фильтров
    const setIsOwnRegionsFilter = React.useCallback((value: boolean) => {
        if (value) {
            setOwnershipFilter('own');
        } else {
            setOwnershipFilter('all');
        }
    }, []);

    const setIsNotOwnRegionsFilter = React.useCallback((value: boolean) => {
        if (value) {
            setOwnershipFilter('notOwn');
        } else {
            setOwnershipFilter('all');
        }
    }, []);

    // Для обратной совместимости с существующим кодом
    const isCheckedFilter = ownershipFilter === 'own';
    const setIsCheckedFilter = setIsOwnRegionsFilter;



    const handleRowClick = (regionId: number) => {
        router.push(`/portal/${portalId}/garant/regions/${regionId}`);
    };

    const handleEdit = (portalRegions: GetPortalRegionResponseDto) => {
        router.push(`/portal/${portalId}/garant/regions/${portalRegions.id}/edit`);
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        // Оптимистичное обновление UI
        const updateOptimistic = (prev: GetPortalRegionResponseDto[] | null) => {
            const source = prev || portalRegions || [];
            return source.map((region: GetPortalRegionResponseDto) =>
                region.id === id ? { ...region, isChecked: !checked } : region
            );
        };
        setOptimisticRegions(updateOptimistic);

        if (checked) {
            //delete
            deletePortalRegion(
                {
                    portalId,
                    regionId: Number(id),
                },
                {
                    onError: () => {
                        // Откатываем оптимистичное обновление при ошибке
                        setOptimisticRegions(null);
                    },
                }
            );
        } else {
            // create
            createPortalRegion(
                {
                    portalId,
                    regionId: Number(id),
                },
                {
                    onError: () => {
                        // Откатываем оптимистичное обновление при ошибке
                        setOptimisticRegions(null);
                    },
                }
            );
        }
    };

    // Сбрасываем оптимистичные обновления при изменении данных из сервера
    React.useEffect(() => {
        if (portalRegions) {
            setOptimisticRegions(null);
        }
    }, [portalRegions]);
    return {
        regions,
        isLoading,
        // deletePortalRegion,
        // portalRegionsToDelete,
        search,
        setSearch,
        // Фильтры принадлежности
        ownershipFilter,
        setOwnershipFilter,
        isOwnRegionsFilter: ownershipFilter === 'own',
        setIsOwnRegionsFilter,
        isNotOwnRegionsFilter: ownershipFilter === 'notOwn',
        setIsNotOwnRegionsFilter,
        // Для обратной совместимости
        isCheckedFilter,
        setIsCheckedFilter,
        handleCheckboxChange,

        handleRowClick,
        handleEdit,
        // handleDelete,
        // confirmDelete
    };
};
