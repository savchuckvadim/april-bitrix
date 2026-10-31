interface PortalRegionsCardRowProps {
    label: string;
    value: string | number;
}

export function PortalRegionsCardRow({
    label,
    value,
}: PortalRegionsCardRowProps) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
