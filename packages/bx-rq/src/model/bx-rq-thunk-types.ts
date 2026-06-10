// Типы для интеграции с основным приложением
// Эти типы должны быть импортированы из основного store приложения

export interface AppState {
    app: {
        domain: string;
        company: number;
    };
    bxrq: any; // BXRQState из slice
    documentClientType: any; // ClientTypeState
}

export interface AppDispatch {
    (action: any): any;
}

export interface RootState {
    app: AppState['app'];
    bxrq: AppState['bxrq'];
    documentClientType: AppState['documentClientType'];
}

// Типы для RTK thunk
export type AppThunkDispatch = AppDispatch;
export type AppThunkGetState = () => RootState;
