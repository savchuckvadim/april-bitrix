import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from "@workspace/ui/components/table";


const products = [
    {
        name: "Гарант-Эксперт PRO TRUE Интернет 1 ОД",
        price: 8008,
        quantity: 12,
        unit: "мес.",
        total: 96096,
    },
    {
        name: "ГАРАНТ-LegalTech. Малый пакет",
        price: 1512,
        quantity: 12,
        unit: "мес.",
        total: 18144,
    },
];

export function DocumentTable() {
    return (
        <div className="p-4">
            <Table>
                <TableCaption>Список продуктов</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px]">Наименование</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Количество</TableHead>
                        <TableHead>Единица</TableHead>
                        <TableHead>Сумма</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.name}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.price}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>{product.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
