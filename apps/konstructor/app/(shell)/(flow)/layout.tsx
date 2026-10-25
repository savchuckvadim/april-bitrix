import { FlowLayout } from '@/modules/processes/konstructor';

/** Шаги сборки: степпер и цвет комплекта над экраном шага. */
export default function FlowGroupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <FlowLayout>{children}</FlowLayout>;
}
