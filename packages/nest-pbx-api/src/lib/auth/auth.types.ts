export interface AuthInterceptorOptions {
    /**
     * Called when both access and refresh tokens are invalid.
     * Typically: redirect to login page, clear state.
     */
    onAuthFailed?: () => void;

    /**
     * Called on non-401 API errors with a parsed message.
     * Typically: show a toast notification.
     */
    onApiError?: (message: string, status: number) => void;
}
