export const ComponentPreloader = ({ text }: { text?: string }) => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                {text && <p className="text-muted-foreground">{text}</p>}
            </div>
        </div>
    );
};
