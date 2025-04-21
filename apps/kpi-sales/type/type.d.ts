export { };

declare global {
    interface Window {
        Pace: {
            on: (event: string, callback: () => void) => void;
        };
    }
}
declare const Pace: any;

