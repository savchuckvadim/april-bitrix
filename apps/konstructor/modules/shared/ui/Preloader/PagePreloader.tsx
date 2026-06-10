export const PagePreloader = ({ text }: { text?: string }) => {
    return (
        <div className="flex inset-0 backdrop-blur-xs items-center justify-center h-screen min-w-full fixed top-0 left-0 z-50 opacity-95">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background w-1/3 h-1/3 rounded-lg p-4 flex flex-col items-center justify-center z-150">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary mx-auto mb-4"></div>
                {text && <p className="text-primary">{text}</p>}
            </div>
        </div>
    );
};
