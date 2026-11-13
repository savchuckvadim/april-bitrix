import { FrameFlowLayout } from '@/modules/app/ui/FrameFlowLayout';

/** Шаги сборки: степпер и цвет комплекта над экраном шага. */
export default function FlowGroupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <FrameFlowLayout>{children}</FrameFlowLayout>;
}
