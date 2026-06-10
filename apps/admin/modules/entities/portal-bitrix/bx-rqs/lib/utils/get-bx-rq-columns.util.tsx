import { Column } from "@/modules/shared";
import { BxRqResponseDto } from "@workspace/nest-api";
import { Button } from "@workspace/ui/components";

export const getBxRqColumns = (
    onEdit?: (item: BxRqResponseDto) => void,
    onDelete?: (item: BxRqResponseDto) => void,
): Column<BxRqResponseDto>[] => {
    const columns: Column<BxRqResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            className: 'w-48',
        },
        {
            id: 'bitrix_id',
            header: 'Bitrix ID',
            accessorKey: 'bitrix_id',
            className: 'w-48',
        },
        {
            id: 'code',
            header: 'Code',
            accessorKey: 'code',
            className: 'w-48',
        },
        {
            id: 'type',
            header: '   Type',
            accessorKey: 'type',
            className: 'w-48',
        },
        {
            id: 'created_at',
            header: 'Created at',
            accessorKey: 'created_at',
            className: 'w-48',
        },
        {
            id: 'updated_at',
            header: 'Updated at',
            accessorKey: 'updated_at',
            className: 'w-48',
        },

        {
            id: 'actions',
            header: 'Действия',
            cell: (row) => (
                <div className="flex gap-2">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                            }}
                        >
                            Изменить
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            ),
            className: 'w-48',
        },
    ];
    return columns;
};